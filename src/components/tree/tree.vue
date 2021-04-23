<template>
  <div class="m-tree">
    <ul>
      <li v-for="(item, index) in treeNode" :key="index">
        <TreeNode :nodeData="item" :render-content="renderContent"> </TreeNode>
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
      treeNode: [],
      isTree: true,
    };
  },
  watch: {
    treeData: {
      handler() {
        this.setTreeNode();
        this.setCheckKeys();
        this.setDisabledNode();
      },
      immediate: true,
    },
    defaultDisabledKeys: {
      handler() {
        this.setDisabledNode();
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * desc: 初始化check状态
     * 层级checked：0(未选中) ，1(半选)，2（选中）
     */
    setCheckKeys() {
      if (!this.showCheckBox) {
        console.warn("showCheckBox = false 时,defaultCheckedKeys 无效");
        return;
      }
      if (this.defaultCheckedKeys.length === 0) return;
      const _this = this;
      const addCheck = (node) => {
        node.checked = 2;
        if (node.children.length === 0) {
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
      this.treeNode.forEach((node) => cycleFun(node));
    },
    /**
     * desc: 根据数据渲染树结构
     * 层级checked：0(未选中) ，1(半选)，2（选中）
     */
    setTreeNode() {
      const fun = (item) => {
        item.children.forEach((element) => {
          element.parent = item;
          this.showCheckBox && this.$set(element, "checked", 0);
          fun(element);
        });
      };
      this.treeData.forEach((item) => {
        let obj = {};
        Object.assign(obj, item);
        obj.parent = this.treeNode;
        this.showCheckBox && this.$set(obj, "checked", 0);
        this.treeNode.push(obj);
        fun(obj);
      });
    },
    setDisabledNode() {
      if (this.defaultDisabledKeys.length === 0) return;
      const _this = this;
      const cycleFun = (node) => {
        if (_this.defaultDisabledKeys.indexOf(node.id) > -1) {
          this.$set(node, "disabled", true);
        } else {
          this.$set(node, "disabled", false);
        }
        node.children.forEach((child) => {
          cycleFun(child);
        });
      };
      this.treeNode.forEach((node) => cycleFun(node));
    },
    /**
     * desc: 获取选中的节点
     */
    getCheckedNodes() {
      let nodeList = [];
      let getCheckedList = (node) => {
        if (node.children.length === 0 && node.checked === 2) {
          nodeList.push({ ...node });
          return;
        }
        node.children.forEach((item) => {
          getCheckedList(item);
        });
      };
      this.treeNode.forEach((item) => getCheckedList(item));
      return nodeList;
    },
    /**
     * desc: 获取选中的节点Id
     */
    getCheckedKeys() {
      let list = this.getCheckedNodes();
      return list.map((item) => item.id);
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
