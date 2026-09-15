```
TIMEFMT='%J  %*E elapsed  (user %*U, sys %*S)'
time npx cdk diff BackendStack FrontStack
```

時間比較
```
# diff
npx cdk diff BackendStack FrontStack  30.991 elapsed  (user 6.854, sys 0.885)
npx cdkd diff BackendStack FrontStack  6.167 elapsed  (user 6.668, sys 0.831)
# deploy
npx cdk deploy BackendStack FrontStack  7:40.58 elapsed  (user 11.457, sys 1.847)
time npxd cdk deploy BackendStack FrontStack

# destroy
npx cdk destroy BackendStack FrontStack  5:42.59 elapsed  (user 9.447, sys 1.356)

```

#　その他
```
# すでにaws-cdkで作ったStackをcdkdに移行
cdkd import MyStack --migrate-from-cloudformation
# その後は通常にdeploy
cdkd deploy MyStack
```

# メモ
IAMロールなど削除ポリシーはデフォルト RETAIN の場合、cdk destoryの実行でも残るため、注意。  
-> cdkdに関わらずcdkあるある

