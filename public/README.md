# 鼠标事件执行顺序
- `mousedown` (按下)  ==》 触发mousedown事件
- `mousedown` (第二次按下)  ==》 触发dblclick事件
- `mousemove` (按下后移动) ==》触发dragmove事件
- `mouseup` （按下后释放） ==》 触发click事件

# git命令
1) git add .   #添加所有文件
2) git commit -m "首次提交全部文件"  --no-verify  #提交并且忽略eslint检测
3) git push origin master  #推送到远程仓库
   git push #推送到远程仓库，默认推送到 master 分支
4) git status  #查看当前状态
5) git log  #查看提交日志
6) git log --oneline  #查看简洁的提交日志
7) git log --graph --oneline --all  #查看图形化的提交日志
8) git reset --hard HEAD^  #回退到上一个版本
9) git reset --hard HEAD~2  #回退到上上个版本
10) git reset --hard commit_id  #回退到指定版本
11) git checkout commit_id -- filename  #将指定文件回退到指定版本           

