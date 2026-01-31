# ブランチルール（個人開発用）

このリポジトリで想定しているブランチ運用です。

## 適用状況

- **GitHub のブランチ保護ルール（API）**: 現状は **適用されていません**。
  - プライベートリポジトリでは、ブランチ保護ルールの利用に **GitHub Pro** が必要です。
  - [Branch protection - GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/managing-branch-protection-rules)
- リポジトリを **公開** するか、**GitHub Pro** にすると、同じ内容のルールを GitHub の「Branch protection rules」から設定できます。

## 推奨する運用（ローカルルール）

個人開発として、以下を習慣にすると安全です。

| 項目 | 推奨 |
|------|------|
| **main** | 常に壊さない・直接 push は可。force push はしない。 |
| **作業ブランチ** | `feature/xxx` や `fix/xxx` で作業し、main にマージ。 |
| **force push** | main には行わない。 |
| **main の削除** | 行わない。 |

## 保護ルールを有効にする場合

1. リポジトリを **Public** にする、または **GitHub Pro** を契約する。
2. GitHub: **Settings → Branches → Add branch protection rule** で `main` を指定。
3. 次の内容で設定する（`branch-protection-payload.json` と同じ方針）:
   - Require a pull request before merging: **オフ**（個人開発のため）
   - Require status checks: **オフ**
   - Do not allow bypassing the above settings: **オフ**
   - **Allow force pushes: オフ**
   - **Allow deletions: オフ**

または、リポジトリが Public になったあと、同じディレクトリで以下を実行すると API から適用できます。

```bash
gh api --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/Rons-29/cursor-ai-tracking-insights/branches/main/protection \
  --input .github/branch-protection-payload.json
```

## 参考

- [Managing branch protection rules - GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/managing-branch-protection-rules)
- [Update branch protection - GitHub REST API](https://docs.github.com/rest/branches/branch-protection#update-branch-protection)
