# Vue実装における設計評価

## 概要

`@todo-example/front`パッケージにフレームワーク非依存のドメインロジックを事前定義し、`packages/vue`からそれを利用する形でVueアプリケーションを実装した。本ドキュメントでは、この設計判断の評価を行う。

---

## 実装構成

### frontパッケージ（事前定義済み）
- 値オブジェクト: DisplayTask, ViewState, FilterState等
- 純粋関数: buildTaskListView, resolveManualOrder, applyFilter等
- URL同期用codec: encodeToRecord, decodeFromRecord

### vueパッケージ（今回実装）
```
packages/vue/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── stores/
│   │   └── useTodoStore.ts    # frontパッケージとVueの橋渡し
│   └── components/
│       ├── TaskList.vue
│       ├── TaskSection.vue
│       ├── TaskItem.vue
│       ├── TaskForm.vue
│       ├── FilterBar.vue
│       └── ViewSelector.vue
```

---

## 比較評価

### ケース1A: 事前定義なし・制約なしで実装した場合

#### 想定される実装の姿

```typescript
// 典型的なVueコンポーネント内での実装例
const tasks = ref<Task[]>([]);
const searchQuery = ref("");
const sortType = ref("manual");

const filteredTasks = computed(() => {
  let result = tasks.value;
  if (searchQuery.value) {
    result = result.filter(t =>
      t.title.includes(searchQuery.value) ||
      t.description.includes(searchQuery.value)
    );
  }
  // ソート処理もここに...
  return result;
});

// D&D処理もコンポーネント内に直接記述
function handleDrop(dragIndex: number, dropIndex: number) {
  const newTasks = [...tasks.value];
  const [removed] = newTasks.splice(dragIndex, 1);
  newTasks.splice(dropIndex, 0, removed);
  tasks.value = newTasks;
}
```

#### 今回の実装との違い

| 観点 | 事前定義なし | 今回の実装 |
|------|-------------|-----------|
| 実装速度（初期） | 速い | 遅い（front packageが既にあったため相殺） |
| フィルタ中D&Dの仕様準拠 | 忘れやすい・実装漏れしやすい | 強制的に正しい実装になる |
| テスト | UIテスト依存 | ドメインロジックは単体テスト可能 |
| React版を作る場合 | ゼロから再実装 | 同じfrontパッケージを使用可能 |

#### 評価

- **実装コストは同等か若干低い可能性がある**: 今回の実装でも、store層でVue特有のref/computedは必要だった。事前定義がなくても同程度の行数になった可能性がある
- **仕様の複雑さがポイント**: 仕様書セクション3の「フィルタ中の並び替えで全体順序を正しく計算する」は複雑。事前定義がなければ、この仕様を見落とすか、誤った実装をする確率が高い
- **デモ用途なら事前定義なしでも十分だった可能性**: サンプルデータ5件程度で動かすだけなら、複雑なD&D仕様は実感しにくい

---

### ケース1B: 事前定義なし・制約あり（Vue/DOM依存禁止）で実装した場合

#### 想定される実装の姿

```typescript
// 実装時にドメインロジックを純粋関数として切り出しながら進める
// ただし事前設計なしで、必要に応じて抽出

// store.ts（Vue層）
const tasks = ref<Task[]>([]);
const viewState = ref<ViewState>({ sort: "manual", filter: {} });

const taskListView = computed(() =>
  buildTaskListView(tasks.value, viewState.value)  // 純粋関数を呼ぶ
);

// taskListBuilder.ts（ドメイン層 - 実装しながら抽出）
export function buildTaskListView(
  tasks: Task[],
  state: ViewState
): TaskListView {
  // フィルタ・ソート・セクション分離ロジック
  // 実装中に「これはVue依存不要だ」と気づいて切り出す
}
```

#### 特徴

| 観点 | 評価 |
|------|------|
| 事前設計コスト | なし（実装しながら発見） |
| 分離の一貫性 | 低い（人による判断のばらつき） |
| 抽出タイミング | 後から（リファクタリング的） |
| 境界の明確さ | 曖昧になりやすい |
| テスト可能性 | 抽出した部分のみNode.jsで可能 |

#### 評価

- **「制約あり」の効果は限定的**: 制約を設けても、事前定義がなければ「何をどこまで純粋関数にするか」の判断が実装者に委ねられる。結果として分離が中途半端になりやすい
- **抽出の粒度がばらつく**: ある開発者は`buildTaskListView`全体を切り出し、別の開発者は`applyFilter`だけを切り出す、といった不整合が生じやすい
- **後からの抽出は難しい**: 最初からVue依存で書いてしまうと、後から純粋関数として抽出するのは手間がかかる。特に`ref`の`.value`アクセスがコード全体に散らばると、抽出時の修正箇所が多くなる
- **制約の強制手段が必要**: ESLintルールやディレクトリ構造による分離など、制約を実際に強制する仕組みがないと、制約は形骸化しやすい

#### ケース1A（制約なし）との違い

| 観点 | 1A: 制約なし | 1B: 制約あり |
|------|-------------|-------------|
| 実装速度 | 速い | やや遅い（分離を意識） |
| 最終的な構造 | 全てVue依存 | 一部が純粋関数 |
| テスト容易性 | 低い | 中（抽出した部分のみ） |
| React版への流用 | 不可能 | 部分的に可能 |
| 分離の品質 | - | 開発者依存でばらつく |

#### 結論

事前定義なしで制約だけを設けるケースは、**「意図は良いが実効性が低い」**パターンになりやすい。制約を活かすには、以下のいずれかが必要：

1. **事前に型・インターフェースを定義する**（今回の実装に近づく）
2. **厳格なコードレビュー体制**で分離を監視する
3. **ESLint/アーキテクチャテスト**で依存方向を強制する

制約だけを口頭で伝えても、時間的プレッシャーの中で「とりあえずVueで書いてしまう」誘惑に勝つのは難しい。

---

### ケース2: 事前定義あり・制約あり（今回の実装）

#### 実際の実装の姿

```typescript
// frontパッケージ: 純粋関数のみ（Vue依存なし）
export function buildTaskListView(
  tasks: readonly DisplayTask[],
  state: ViewState
): TaskListView {
  const filteredTasks = applyFilter(tasks, state.filter);
  const { withDue, withoutDue } = splitByDueSection(filteredTasks);
  return createTaskListView(
    sortTasks(withDue, state.sort),
    sortTasks(withoutDue, state.sort)
  );
}

// vueパッケージ: 橋渡し層でVueリアクティビティに接続
export function useTodoStore() {
  const tasks = ref<DisplayTask[]>([]);
  const viewState = ref<ViewState>(createViewState());

  // frontパッケージの純粋関数をcomputedでラップ
  const taskListView = computed(() =>
    buildTaskListView(orderedTasks.value, viewState.value)
  );
  // ...
}
```

#### 特徴

| 観点 | 評価 |
|------|------|
| 依存方向 | UI → ドメイン（単方向） |
| ドメインテスト | Node.jsのみで実行可能 |
| 型安全性 | frontパッケージの型に従う必要あり |
| 橋渡しコスト | useTodoStore.tsで約150行必要 |
| 複数UI対応 | React版でも同じfrontパッケージを使用可能 |

#### 評価

- **制約が設計を強制する**: Vue依存を禁止することで、ドメインロジックが純粋関数として維持される。これは意図的な設計判断であり、規律がなければ崩れやすい境界を明確に保つ
- **橋渡し層の存在が可視化される**: useTodoStore.tsという明確な境界層があることで、「どこまでがドメインか」が明示される。ただし、この層自体がボイラープレート的になる傾向がある
- **型の不一致リスクは残る**: UI側で新しい概念が必要になった場合はドメイン更新が必要
- **テストの信頼性は高い**: frontパッケージのテストはVueに依存しないため、UIフレームワークのバージョンアップでテストが壊れることがない

---

### ケース3: 事前定義あり・制約なし（Vue依存許可）

#### 想定される実装の姿

```typescript
// frontパッケージ内でVue依存を許可した場合
import { ref, computed } from "vue";

export function useTodoStore() {
  const tasks = ref<DisplayTask[]>([]);
  const viewState = ref<ViewState>(createViewState());

  const taskListView = computed(() =>
    buildTaskListView(tasks.value, viewState.value)
  );

  // ...すべてのロジックがここに統合
}
```

#### 今回の実装との違い

| 観点 | Vue依存許可 | 今回の実装 |
|------|------------|-----------|
| 層の分離 | ストアとドメインが混在 | 明確に分離 |
| frontパッケージのテスト | Vue/JSDOMが必要 | 純粋なNode.jsで実行可能 |
| React版への流用 | 不可能 | 可能 |
| 実装の自然さ | 高い（Vueらしい書き方） | やや不自然な橋渡しが必要 |

#### 評価

- **今回の実装には「橋渡しの冗長さ」がある**: useTodoStore.tsを見ると、frontパッケージの関数をラップしてVueのリアクティビティに接続する処理が多い。Vue依存を許可すれば、この層は不要になる
- **完了状態はcompletedAtで表現**: 以前のCOMPLETED_TAG_IDハックは不要になり、ドメインモデルとUIの乖離が減った
- **React版を本当に作るかが判断基準**: 作らないなら、分離のコストは回収できない

---

### ケース4: 大規模フレームワーク変更（Vue 2→3等）を想定した場合

#### Vue 2→3で実際に起きた主要な破壊的変更
- Options API → Composition API（書き方の根本的変更）
- `this`ベースのアクセス → `ref`/`reactive`ベースのリアクティビティ
- Vuex → Pinia（状態管理ライブラリの世代交代）
- `Vue.use()` → `app.use()`（プラグインシステム変更）

#### 今回の実装（ドメイン分離あり）の場合

**書き換えが必要な箇所**
- useTodoStore.ts: `ref`/`computed`の使い方が変わる場合は修正必要
- 各コンポーネント: `inject`/`provide`の仕様変更があれば修正

**書き換え不要な箇所**
- `@todo-example/front`パッケージ全体（約20ファイル）
- `buildTaskListView`, `resolveManualOrder`等の純粋関数すべて
- 型定義すべて

#### ドメイン分離なし（Vue依存許可）の場合

**書き換えが必要な箇所**
- すべてのロジックがVueのリアクティビティに依存
- Options APIで書いていた場合、全面的なComposition API移行

```javascript
// Vue 2 (Options API + Vuex)
export default {
  computed: {
    ...mapState(['tasks', 'viewState']),
    taskListView() {
      // フィルタ・ソートロジックがここに埋め込まれている
      return this.tasks
        .filter(t => this.matchesFilter(t))
        .sort((a, b) => this.compareBySort(a, b));
    }
  },
  methods: {
    handleDrop(drag, drop) {
      // D&Dロジックもここに
    }
  }
}

// Vue 3への移行時、上記すべてを書き換え
```

#### 定量的な比較（今回の実装ベース）

| 観点 | 分離あり | 分離なし |
|------|---------|---------|
| Vue移行時の書き換え対象 | 約800行 | 約2,300行 |
| 書き換え対象比率 | 35% | 100% |
| テスト再実行が必要な範囲 | Vue層のみ | 全体 |
| 移行中の機能停止リスク | 低い | 高い |

#### 評価

**分離のメリットが明確に出るケース**
1. **ロジックの複雑さが高い場合**: `resolveManualOrder`のような50行超のアルゴリズムは、Vue 2でもVue 3でも同じ。これを再実装・再テストせずに済むのは大きい
2. **移行期間が長い場合**: 段階的移行で「ドメインはそのまま、UIだけ順次Vue 3化」が可能
3. **テストの信頼性**: ドメインテストはVueバージョンに関係なく通り続ける

**分離のメリットが薄いケース**
1. **ロジックが単純な場合**: 今回のストア層（約150行）程度なら、全部書き直しても数時間
2. **Vue 3移行ツールが成熟している場合**: 実際、Vue 2→3には公式の移行ビルドやeslintプラグインがあり、機械的な変換が可能な部分も多い
3. **Composition APIを最初から使っている場合**: Vue 3.xから4.xへの変更は、2→3ほど破壊的にはならない可能性が高い

---

## 総合評価

### 4ケースの比較表

| 観点 | 1A: 定義なし・制約なし | 1B: 定義なし・制約あり | 2: 定義あり・制約あり（今回） | 3: 定義あり・制約なし |
|------|----------------------|----------------------|------------------------------|----------------------|
| 初期実装速度 | 速い | やや遅い | 中（frontが既存なら速い） | 速い |
| 仕様準拠の確実性 | 低い | 低〜中（開発者依存） | 高い（強制される） | 高い（強制される） |
| 分離の一貫性 | なし | 低い（ばらつく） | 高い（事前定義で統一） | 混在 |
| ドメインテスト | UIテスト依存 | 部分的にNode.js可能 | Node.jsのみで可能 | JSDOM必要 |
| React版への流用 | 不可能 | 部分的に可能 | 可能 | 不可能 |
| 橋渡しコスト | なし | 不定（抽出次第） | 約150行 | なし |
| 型の柔軟性 | 高い | 高い | 低い（制約に従う） | 中 |
| Vue移行時の書き換え | 全体 | 大部分 | UI層のみ | 全体 |
| 制約の実効性 | - | 低い（形骸化しやすい） | 高い（型で強制） | - |

### 分離が効果を発揮した点
1. `resolveManualOrder`のような複雑なアルゴリズムが再利用可能な形で存在した
2. URL同期のcodecが既にテスト済みで、そのまま使えた
3. 型定義が明確で、何を渡すべきか迷わなかった

### 分離がコストになった点
1. store層での橋渡しコード（約100行）が必要だった
2. 仕様にない「完了状態」を表現するためにハック的な実装が必要だった
3. frontパッケージの型制約に従う必要があり、柔軟性が下がった

### 結論

このプロジェクトの目的が「フロントエンド設計教材」であることを考慮すると、分離のメリットとデメリットの両方を示せる良い事例になっている。ただし、**デモアプリケーションとしての完成度**という観点では、Vue依存を許可した方がシンプルで保守しやすいコードになった可能性がある。

分離の価値は「複数UI実装」と「ドメインロジックの単体テスト」にある。後者はVue依存でもVitest + JSDOMで達成可能。前者（React版）を実際に作成して初めて、この設計判断の真価が問われる。

**大規模フレームワーク変更を想定すると、分離の価値は上がる。** ただし、以下の条件を満たす場合に限る：

1. **ドメインロジックに一定の複雑さがある**: 単純なCRUDなら分離コストの方が高い
2. **フレームワーク移行を実際に行う予定がある**: 「いつか移行するかも」程度では投資回収できない
3. **段階的移行が求められる**: 一括移行できるなら、分離していなくても問題は少ない

今回のTODOアプリの場合、`resolveManualOrder`（フィルタ中D&Dの全体順序計算）と`buildTaskListView`（セクション分離＋フィルタ＋ソート）は十分に複雑であり、Vue依存なしで保持できる価値がある。

一方、`useTodoStore.ts`の橋渡し層は、Vue 2→3でも書き換えが必要。この層のコストは分離してもしなくても発生するため、**分離の真のメリットは「純粋関数として切り出されたアルゴリズム部分」にある**と言える。
