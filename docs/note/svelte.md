# Svelte実装における設計評価

## 概要

`@todo-example/front` パッケージにフレームワーク非依存のロジックを定義し、`packages/svelte` から利用する形で Svelte アプリケーションを実装した。本ドキュメントでは、Vue/React版と同様の比較軸で設計判断を評価する。

---

## 実装構成

### frontパッケージ（事前定義済み）
- 値オブジェクト: DisplayTask, ViewState, FilterState など
- 純粋関数: buildTaskListView, resolveManualOrder, applyFilter など
- URL同期用codec: encodeToRecord, decodeFromRecord

### svelteパッケージ（今回実装）
```
packages/svelte/
├── src/
│   ├── main.ts
│   ├── App.svelte
│   ├── stores/
│   │   └── todoStore.ts    # frontパッケージとSvelteの橋渡し
│   └── components/
│       ├── TaskList.svelte
│       ├── TaskSection.svelte
│       ├── TaskItem.svelte
│       ├── TaskForm.svelte
│       ├── FilterBar.svelte
│       └── ViewSelector.svelte
```

---

## 比較評価

### ケース1A: 事前定義なし・制約なし

#### 想定される実装の姿

```svelte
<script>
  let tasks = [];
  let query = "";

  $: filtered = tasks.filter(task =>
    task.title.includes(query) || task.description.includes(query)
  );

  function handleDrop(dragIndex, dropIndex) {
    // D&Dの並び替えもここに直接記述
  }
</script>
```

#### 評価

- **実装速度は最速**: Svelteだけで完結するため初期実装が早い
- **仕様漏れが起きやすい**: フィルタ中D&Dの順序規則などが埋もれる
- **テストがUI依存になりがち**: ロジックがコンポーネントに集中する
- **他UIへの流用は困難**: Vue/React版は実質別実装になる

---

### ケース1B: 事前定義なし・制約あり（Svelte/DOM依存禁止）

#### 想定される実装の姿

```ts
// Svelte側
$: view = buildTaskListView(tasks, viewState);

// 実装中に「これはUI依存不要だ」と気づいて切り出す
export function buildTaskListView(tasks: Task[], state: ViewState) {
  // フィルタ・ソート・セクション分離
}
```

#### 評価

- **分離の意識は生まれる**: Svelte依存の排除は意識される
- **抽出粒度が人に依存**: どこまで切り出すかがバラつく
- **境界が曖昧になる**: 「何がドメインか」が説明しづらい
- **再利用性は限定的**: 一部だけが流用可能になりやすい

---

### ケース2: 事前定義あり・制約なし（Svelte依存許可）

#### 想定される実装の姿

```ts
// frontパッケージ内でSvelte依存を許可した場合
import { writable, derived } from "svelte/store";

export function createTodoStore() {
  const tasks = writable<DisplayTask[]>([]);
  const viewState = writable(createViewState());

  const taskListView = derived(
    [tasks, viewState],
    ([$tasks, $viewState]) => buildTaskListView($tasks, $viewState)
  );

  // ...ロジックがここに統合
}
```

#### 評価

- **実装は自然で書きやすい**: Svelteストアで完結できる
- **ドメインがSvelteに固定される**: Vue/React版への流用ができない
- **テストにSvelte環境が必要**: frontの単体テスト独立性が下がる
- **境界が崩れやすい**: UI都合でロジックが変質しやすい

---

### ケース3: 事前定義あり・制約あり（今回の実装）

#### 実際の実装の姿

```ts
// frontパッケージ: 純粋関数のみ（Svelte依存なし）
export function buildTaskListView(
  tasks: readonly DisplayTask[],
  state: ViewState
): TaskListView {
  // フィルタ・ソート・セクション分離
}
```

```ts
// Svelte側: 橋渡し層でSvelte storeに接続
export const taskListView = derived(
  [orderedTasks, viewState],
  ([$orderedTasks, $viewState]) => buildTaskListView($orderedTasks, $viewState)
);
```

#### 評価

- **仕様がコードに固定される**: フィルタ中D&D等の複雑ルールが守られる
- **ドメインが独立テスト可能**: Svelteの変更に影響されにくい
- **複数UIで同一ロジックを共有可能**: Vue/React版との比較が明確になる
- **橋渡し層の手数は必要**: storeでSvelteに接続するコードが増える

---

### ケース4: Svelteの大型バージョンアップを想定した場合

Assumption: Svelteのメジャーアップデートでコンパイラやランタイム、ストアAPIに破壊的変更が発生するケースを想定する。

#### 分離あり（今回の構成）の場合

**書き換えが必要な箇所**
- Svelte側の store/コンポーネント
- URL同期の処理（ルーティングや履歴API連携が変わる場合）

**書き換え不要な箇所**
- `@todo-example/front` パッケージ全体
- `buildTaskListView`, `resolveManualOrder` などの純粋関数
- 型定義全体

#### 分離なし（Svelte依存許可）の場合

**書き換えが必要な箇所**
- すべてのロジックがSvelteに依存するため影響範囲が広い
- 仕様ロジックの再テスト・再検証が必要になる

#### 評価

- **分離ありは影響範囲を限定できる**: UIの書き換えに集中できる
- **分離なしは影響範囲が拡大する**: ロジックの再確認コストが増える

---

## 総合評価

### 4ケースの比較表

| 観点 | 1A: 定義なし・制約なし | 1B: 定義なし・制約あり | 2: 定義あり・制約なし | 3: 定義あり・制約あり（今回） |
|------|----------------------|----------------------|----------------------|------------------------------|
| 初期実装速度 | 速い | やや遅い | 速い | 中（frontが既存なら速い） |
| 仕様準拠の確実性 | 低い | 低〜中（開発者依存） | 中 | 高い（強制される） |
| 分離の一貫性 | なし | 低い（ばらつく） | 混在 | 高い（事前定義で統一） |
| ドメインテスト | UIテスト依存 | 部分的に可能 | Svelte環境が必要 | Node.jsのみで可能 |
| Vue/React版への流用 | 不可能 | 部分的に可能 | 不可能 | 可能 |
| 橋渡しコスト | なし | 不定（抽出次第） | なし | あり |
| 型の柔軟性 | 高い | 高い | 中 | 低い（制約に従う） |
| Svelte大型更新時の影響 | 全体 | 大部分 | 全体 | UI層中心 |
| 制約の実効性 | - | 低い（形骸化しやすい） | - | 高い（型で強制） |

### 分離が効果を発揮した点
1. `resolveManualOrder` のような複雑アルゴリズムが、Svelte/Vue/Reactで共通利用できる
2. URL同期のcodecが既にテスト済みで、そのまま使える
3. 型定義が固定され、UI側の実装判断が迷いにくい

### 分離がコストになった点
1. store層の橋渡しコードが必要になる
2. UI側でfrontの型制約に従う必要がある
3. 簡易な実装だけを求める場合は過剰に見える可能性がある

### 結論

このプロジェクトの目的が「フロントエンド設計教材」であることを考慮すると、Svelte版でも **事前定義あり・制約あり** が最も説明しやすく、Vue/React版との比較も成立する。一方で、単独のSvelteアプリとして見た場合は、橋渡し層のコストが見えるため「本当に複数UIを作るのか」が分離判断の鍵になる。

Svelteの大型バージョンアップを想定すると、分離の価値は上がる。UI層の書き換えに集中でき、ドメインの再実装や再テストを避けられるため、移行コストとリスクを抑えられる。
