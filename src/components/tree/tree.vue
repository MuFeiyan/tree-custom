<template>
  <div class="m-tree">
    <ul>
      <li v-for="(item, index) in treeNode.children" :key="index">
        <TreeNode
          :nodeData="item"
          :render-content="renderContent"
          @parentCheckChange="checkChanged"
          @nodeClick="nodeClick"
        >
        </TreeNode>
      </li>
    </ul>
  </div>
</template>
<script>
import "../../assets/iconfont/iconfont.css";
import TreeNode from "./tree-node";
export default {
  name: "Tree",
  componentName: "Tree",
  components: { TreeNode },
  provide() {
    return {
      defaultExpandKeys: this.defaultExpandKeys,
      defaultDisabledKeys: this.defaultDisabledKeys,
      showCheckBox: this.showCheckBox,
      showFoldIcon: this.showFoldIcon,
    };
  },
  props: {
    defaultDisabledKeys: {
      type: Array,
      default: () => {
        return [];
      },
    },
    defaultExpandKeys: {
      type: Array,
      default: () => {
        return [];
      },
    },
    defaultCheckedKeys: {
      type: Array,
      default: () => {
        return [];
      },
    },
    treeData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    showCheckBox: {
      type: Boolean,
      default: true,
    },
    showFoldIcon: {
      type: Boolean,
      default: true,
    },
    renderContent: Function,
  },
  data() {
    return {
      checkedKeys: [],
      treeNode: {
        id: "mm",
        label: "mm",
        children: [],
      },
      isTree: true,
    };
  },
  watch: {
    treeData: {
      handler() {
        this.setTreeNode();
        this.setCheckKeys();
      },
      immediate: true,
    },
    defaultCheckedKeys: {
      handler() {
        this.setCheckKeys();
      },
      immediate: true,
    },
  },
  methods: {
    setCheckKeys() {
      let checkArr = [];
      const _this = this;
      const addCheck = (node) => {
        node.checked = 2;
        if (node.children.length === 0) {
          checkArr.push(node.id);
          return;
        }
        node.children.forEach((item) => addCheck(item));
      };
      const cycleFun = (node) => {
        if (_this.defaultCheckedKeys.indexOf(node.id) > -1) {
          addCheck(node);
        }
        node.children.forEach((child) => {
          cycleFun(child);
        });
      };
      cycleFun(this.treeNode);
      this.checkedKeys = Array.from(new Set(checkArr.concat(this.checkedKeys)));
    },
    /**
     * desc: 根据数据渲染树结构
     * 层级checked：0(未选中) ，1(半选)，2（选中）
     */
    setTreeNode() {
      const fun = (item) => {
        item.children.forEach((element) => {
          element.parent = item;
          this.$set(element, "checked", 0);
          fun(element);
        });
      };
      this.treeData.forEach((item) => {
        let obj = {};
        Object.assign(obj, item);
        obj.parent = this.treeNode;
        this.$set(obj, "checked", 0);
        this.treeNode.children.push(obj);
        fun(obj);
      });
    },
    /**
     * @Descriotion : 节点选中/取消状态改变
     * @params : {}
     **/
    checkChanged(arrId, isChecked) {
      let checked = false;
      if (isChecked === 2) {
        // 选中
        checked = true;
        let newArr = this.checkedKeys.concat(arrId);
        this.checkedKeys = Array.from(new Set(newArr));
      } else {
        // 不选中
        arrId.forEach((item) => {
          let index = this.checkedKeys.indexOf(item);
          if (index > -1) this.checkedKeys.splice(index, 1);
        });
      }
      if (!this.$listeners.checkChanged) return;
      this.$emit("checkChanged", checked, arrId);
    },
    getCheckedNodes() {
      let nodeList = [];
      let getCheckedList = (node) => {
        if (node.children.length === 0 && node.checked === 2) {
          nodeList.push(node);
          return;
        }
        node.children.forEach((item) => {
          getCheckedList(item);
        });
      };
      this.treeNode.children.forEach((item) => getCheckedList(item));
      return nodeList;
    },
    getCheckedKeys() {
      let list = this.getCheckedNodes();
      return list.map((item) => item.id);
    },
    nodeClick(opened, nodeData) {
      if (this.$listeners.nodeClick) {
        this.$emit("nodeClick", opened, nodeData);
      }
    },
  },
};
</script>

<style scope>
.m-tree {
  position: relative;
  text-align: left;
  min-width: 200px;
}
.m-tree ul {
  list-style-type: none;
  padding-inline-start: 20px;
}
.inline-block {
  display: inline-block;
}
</style>
