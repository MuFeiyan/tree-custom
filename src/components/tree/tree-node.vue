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
          v-if="nodeData.disabled"
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
            @updateParentCheckStatus="updateCheckStatus"
            @openTreeNode="openTreeNode"
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
    "defaultExpandKeys",
    "defaultDisabledKeys",
    "showCheckBox",
    "showFoldIcon",
  ],
  data() {
    return {
      opened: false,
      tree: null, // 根节点组件实例
    };
  },
  created() {
    if (this.nodeData.checked) {
      // 父级check状态根据子级节点状态更新
      this.$emit("updateParentCheckStatus");
    }
    // 还原节点是否打开
    if (this.defaultExpandKeys.indexOf(this.nodeData.id) > -1) {
      this.$emit("openTreeNode");
    }
    // 最里层子节点默认打开，新增子节点时默认打开方便查看新增数据
    if (this.nodeData.children.length === 0) {
      this.opened = true;
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
      if (this.nodeData.children.length > 0) {
        this.opened = !this.opened;
      }
      if (this.tree.$listeners.nodeClick) {
        let data = { ...this.nodeData };
        delete data.children;
        this.tree.$emit("nodeClick", data, this.opened);
      }
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
      // 自身状态更新
      this.nodeData.checked = checkStatus;
      // 向下，子级
      let arrId = this.childrenCheck(checkStatus);
      // 向上，更新父节点状态
      this.$listeners.updateParentCheckStatus &&
        this.$emit("updateParentCheckStatus");
      // 触发check状态改变事件
      this.tree.$listeners.checkChanged &&
        this.tree.$emit("checkChanged", arrId, checkStatus === 2);
    },
    /**
     * desc: 监听事件，子节点状态改变时更新当前节点check状态
     * params : {
     *    checkStatus: 节点状态
     * }
     */
    updateCheckStatus() {
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
      // 更新父节点状态
      this.$emit("updateParentCheckStatus");
    },
    /**
     * desc: 子级checked状态改变
     * 内部方法：check 迭代方法 遍历当前节点下所有的子节点
     * return: arrId （最内层级选中的节点）
     */
    childrenCheck(checkStatus) {
      let arrId = [];
      let check = (node) => {
        if (node.children.length === 0 && !node.disabled) {
          arrId.push(node.id);
          return;
        }
        node.children.forEach((item) => {
          !item.disabled && (item.checked = checkStatus);
          check(item);
        });
      };
      check(this.nodeData);
      return arrId;
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
