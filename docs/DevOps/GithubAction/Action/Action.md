##  1 action

- [Marketplace](https://github.com/marketplace?type=actions)에서 사람들이 정의한 action을 그대로 가져와 나의 workflow에서 실행할 수 있다.



##  2 [Checkout](https://github.com/marketplace/actions/checkout)

**예시**

```yaml
- name: Checkout Argocd Repo
  uses: actions/checkout@v3
  with:
    repository: 'OOM-DEV/backend-argocd'
    token: '${{ secrets.GIT_HUB_TOKEN }}'
```



##  3 [Add & Commit](https://github.com/marketplace/actions/add-commit)

**예시**

```yaml
- name: Commit Changes
  uses: EndBug/add-and-commit@v9
  with:
    author_name: github-action-bot
    author_email: nameks@naver.com
    add: oom-deployment.yaml
    message: 'Update image tag to ${{ github.ref_name }}'
```



##  4 [GitHub Push](https://github.com/marketplace/actions/github-push)

- The GitHub Actions for pushing to GitHub repository local changes authorizing using GitHub token.



**예시**

```yaml
- name: Push Changes
  uses: ad-m/github-push-action@v0.6.0
  with:
    repository: 'OOM-DEV/backend-argocd'
    branch: main
    github_token: ${{ secrets.GIT_HUB_TOKEN }}
```



**Inputs**

| name             | value   | default               | description                                                  |
| ---------------- | ------- | --------------------- | ------------------------------------------------------------ |
| github_token     | string  | `${{ github.token }}` | [GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow) or a repo scoped [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). |
| ssh              | boolean | false                 | Determines if ssh/ Deploy Keys is used.                      |
| branch           | string  | (default)             | Destination branch to push changes. Can be passed in using `${{ github.ref }}`. |
| force            | boolean | false                 | Determines if force push is used.                            |
| force_with_lease | boolean | false                 | Determines if force-with-lease push is used. Please specify the corresponding branch inside `ref` section of the checkout action e.g. `ref: ${{ github.head_ref }}`. |
| atomic           | boolean | true                  | Determines if [atomic](https://git-scm.com/docs/git-push#Documentation/git-push.txt---no-atomic) push is used. |
| tags             | boolean | false                 | Determines if `--tags` is used.                              |
| directory        | string  | '.'                   | Directory to change to before pushing.                       |
| repository       | string  | ''                    | Repository name. Default or empty repository name represents current github repository. If you want to push to other repository, you should make a [personal access token](https://github.com/settings/tokens) and use it as the `github_token` input. |



##  5 [Setup Java JDK](https://github.com/marketplace/actions/setup-java-jdk#supported-version-syntax)

**예시**

```yaml
- name: Set up JDK 17
  uses: actions/setup-java@v1
  with:
    java-version: 17
```



##  6 [Docker Build & Push Action](https://github.com/marketplace/actions/docker-build-push-action)



**예시**

```yaml

- name: Build and Push Docker Image
  uses: mr-smithers-excellent/docker-build-push@v6
  with:
    image: $DOCKER_IMAGE_NAME
    tags: ${{ github.ref_name }}
    registry: docker.io
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```
