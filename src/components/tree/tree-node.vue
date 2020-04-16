<template>
  <div>
    <div class="m-tree-item" @click="nodeClickHandle">
      <div
        v-if="showFoldIcon && nodeData.children.length > 0"
        class="inline-block"
      >
        <span
          :class="[
            'icon iconfont icontriangle-down fold-icon',
            opened ? '' : 'fold-close-icon',
          ]"
        ></span>
        <!-- <span  class="icon iconfont iconshouqi fold-icon"></span> -->
      </div>
      <div v-if="showCheckBox" class="inline-block check-box">
        <span
          v-if="isDisabled"
          :class="[
            'icon iconfont icon-size',
            nodeData.checked === 0
              ? 'iconfangkuang disabled-two'
              : nodeData.checked === 1
              ? 'iconweiquanxuan disabled-one'
              : 'iconweibiaoti-_xuanzhong disabled-one',
          ]"
        ></span>
        <span
          v-else
          :class="[
            'icon iconfont icon-size',
            nodeData.checked === 0
              ? 'iconfangkuang weixuan-color'
              : nodeData.checked === 1
              ? 'iconweiquanxuan blue-color'
              : 'iconweibiaoti-_xuanzhong blue-color',
          ]"
          @click="checkEvent"
        ></span>
      </div>
      <node-content :node="nodeData"></node-content>
    </div>
    <el-collapse-transition>
      <ul v-if="nodeData.children.length > 0" v-show="opened" class="node-move">
        <li v-for="(item, index) in nodeData.children" :key="index">
          <TreeNode
            :nodeData="item"
            :render-content="renderContent"
            @childCheckChanged="childCheckChanged"
            @parentCheckChange="checkChanged"
            @openTreeNode="openTreeNode"
            @nodeClick="nodeClick"
          >
          </TreeNode>
        </li>
      </ul>
    </el-collapse-transition>
  </div>
</template>

<script>
import TreeNode from "./tree-node";
import eventUtil from "../../assets/js/eventUtil";
import ElCollapseTransition from "../collapseTransition/collapse-transition";
export default {
  name: "TreeNode",
  componentName: "TreeNode",
  components: {
    ElCollapseTransition,
    TreeNode,
    NodeContent: {
      props: {
        node: {
          required: true,
        },
      },
      render(h) {
        const parent = this.$parent;
        const tree = this.$parent.tree;
        const renderContent = tree.renderContent;
        const node = this.node;
        return renderContent ? (
          renderContent.call(parent._renderProxy, h, {
            _self: tree.$vnode.context,
            node,
          })
        ) : tree.$scopedSlots.default ? (
          tree.$scopedSlots.default({ node })
        ) : (
          <span class="tree-text">{node.label}</span>
        );
      },
    },
  },
  props: {
    nodeData: {
      default() {
        return {};
      },
    },
    renderContent: Function,
  },
  inject: [
    "defaultExpendKeys",
    "defaultDisabledKeys",
    "showCheckBox",
    "showFoldIcon",
  ],
  data() {
    return {
      opened: false,
      isDisabled: false,
      tree: null,
    };
  },
  created() {
    // 还原是否选中
    if (this.nodeData.checked === 2) {
      // 父级check状态也需要改变
      this.$emit("parentCheckChange", [this.nodeData.id], 2);
    }
    // 还原是否打开
    if (this.defaultExpendKeys.indexOf(this.nodeData.id) > -1) {
      this.openTreeNode();
    }
    if (this.nodeData.children.length === 0) {
      this.opened = true;
    }
    // 该层级是否是禁用状态
    if (this.defaultDisabledKeys.indexOf(this.nodeData.id) > -1) {
      this.isDisabled = true;
    }
    if (this.$parent.isTree) {
      this.tree = this.$parent;
    } else {
      this.tree = this.$parent.tree;
    }
  },
  methods: {
    /**
     * desc: 所有父级都打开
     */
    openTreeNode() {
      this.opened = true;
      this.$emit("openTreeNode");
    },
    /**
     * desc: 打开/关闭 子节点
     */
    nodeClickHandle() {
      this.opened = !this.opened;
      this.$emit("nodeClick", this.opened, this.nodeData);
    },
    nodeClick(opened, nodeData) {
      this.$emit("nodeClick", opened, nodeData);
    },
    /**
     * desc: 选中/取消选中 事件
     */
    checkEvent(e) {
      eventUtil.stopPropagation(e);
      let checkStatus = 0;
      if (this.nodeData.checked === 2) {
        checkStatus = 0;
      } else {
        checkStatus = 2;
      }
      // 自身
      // this.nodeData.checked = checkStatus;
      this.$emit("childCheckChanged", this.nodeData.id, checkStatus);
      // 向下 子级
      let arrId = this.childrenCheck(checkStatus);
      // 向上 触发父级事件
      this.$emit("parentCheckChange", arrId, checkStatus);
    },
    /**
     * desc: 子级状态改变，父级checked状态改变
     * params { 这两个参数用于传给最外层tree组件；
     *     arrId: 当前操作的最里层节点的id;
     *     isCheck: 0(未选中)， 2（选中）
     * }
     */
    checkChanged(arrId, isCheck) {
      let checkStatus = 1;
      let status = this.nodeData.children.every((item) => {
        return item.checked === 2;
      });
      if (status) {
        checkStatus = 2;
      } else {
        status = this.nodeData.children.every((item) => {
          return item.checked === 0;
        });
        if (status) {
          checkStatus = 0;
        }
      }
      this.nodeData.checked = checkStatus;
      this.$emit("parentCheckChange", arrId, isCheck);
    },
    /**
     * desc: 子级checked状态改变
     * 内部方法：check 迭代方法 遍历当前节点下所有的子节点
     * return: arrId （最内层级选中的节点）
     */
    childrenCheck(checkStatus) {
      let arrId = [];
      let check = (node) => {
        if (node.children.length === 0) {
          arrId.push(node.id);
          return;
        }
        node.checked = checkStatus;
        node.children.forEach((item) => {
          item.checked = checkStatus;
          check(item);
        });
      };
      check(this.nodeData);
      return arrId;
    },
    childCheckChanged(nodeId, checkStatus) {
      let node = this.nodeData.children.find((item) => item.id === nodeId);
      if (node) node.checked = checkStatus;
    },
  },
};
</script>

<style scope>
.collapse-transition {
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out,
    0.3s padding-bottom ease-in-out;
}
.m-tree-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 3px 6px;
  height: 26px;
  line-height: 26px;
}
.icon-size {
  font-size: 14px !important;
}
.tree-text {
  margin-left: 6px;
}
.blue-color {
  color: #409eff;
}
.weixuan-color {
  color: #dcdfe6;
}
.disabled-one {
  font-size: 12px !important;
  color: #f2f6fc;
  background: #c0c4cc;
  border: 0.5px solid #eceff5;
  cursor: not-allowed;
}
.disabled-two {
  color: #dcdfe6;
  background: #edf2fc;
  cursor: not-allowed;
}
.check-box {
  margin-left: 6px;
}
.fold-icon {
  color: #c0c4cc;
  font-size: 10px;
  transform: rotate(0deg);
  transition: transform 0.3s ease-in-out;
  display: inline-block;
}
.fold-close-icon {
  transform: rotate(-90deg);
}
/* 折叠动画 */
.fold-enter-active,
.fold-leave-active {
  transition: all 0.3s linear;
}
.fold-enter,
.fold-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.tree-text {
  width: 100px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
