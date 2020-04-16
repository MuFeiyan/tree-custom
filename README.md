## 安装
npm install tree-custom
import Tree from 'tree-custom'
## 使用 Tree
1 、简单渲染树结构页面<br>
```html
<Tree :treeData="treeData"/>
```

2、设置属性<br>
 - `treeData`:树结构数据,类型：Array, 默认：[]
    example:
    ```js
      [
        {
          id: '0', // nodeId
          label: '子级' + id,
          children: [
           {
             id: '0_0', // nodeId
            label: '子级' + id,
            children: []
            }
         ]
        }
      ]
 - `showFoldIcon`:是否显示打开关闭箭头,类型：boolean, 默认：true
 - `showCheckBox`: 是否显示多选框,类型：boolean, 默认：true
 - `defaultCheckedKeys`：默认选中的nodeId,类型：Array, 默认：[]
 - `defaultExpendKeys`：默认打开的nodeId,类型：Array, 默认：[]
 - `defaultDisabledKeys`：不可以选择的nodeId,类型：Array, 默认：[]

3、Example
```html
<Tree
   ref="tree"
   :treeData="treeData"
   :defaultCheckedKeys="['0']"
   :defaultExpendKeys="['0']"
   :defaultDisabledKeys="['1']"
   :showCheckBox ="false"
   :showFoldIcon ="false"/>
```
  
4、自定义树节点内容
- 方法一
```html
<Tree :treeData="treeData">
  <span class="custom-tree-node" slot-scope="{ node }">
    <span class="tree-text">{{ node.label }}</span>
    <span class="tree-node-btn">
      <button @click="(event) => addNode(event, node)">
        Add
      </button>
      <button @click="(event) => delNode(event, node)">
        Del
      </button>
    </span>
  </span>
</Tree>
```

- 方法二
```html
<Tree :treeData="treeData"
    :renderContent="renderContent"/>
```
```js
renderContent(h, { node }) {
    return (
      <span class="custom-tree-node">
        <span class="tree-text" >{node.label}</span>
        <span class="tree-node-btn">
          <button on-click={ (event) => this.addNode(event, node) }>Add</button>
          <button on-click={ (event) => this.delNode(event, node) }>Del</button>
        </span>
      </span>);
}
```
## Repository
https://github.com/MuFeiyan/tree-custom.git