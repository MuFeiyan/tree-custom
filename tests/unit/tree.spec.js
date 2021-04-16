import Tree from '@/components/tree';
import { mount  } from "@vue/test-utils";
import eventUtil from "../../src/assets/js/eventUtil";

describe("Tree", () => {
  it("测试选中与取消选中", async () => {
    const tree = mount(Tree, {propsData: {
      treeData: initTreeData([2, 2, 2])
      }
    });
    let checkBoxs = getAllCheckBox(tree);
    expect(tree.vm.getCheckedKeys().length).toBe(0);
    // 选中
    await checkBoxs.at(1).trigger('click'); // 使用await相当于在nextTick中调用下面的语句
    expect(tree.vm.getCheckedKeys().toString()).toBe('0_0_0,0_0_1');
    // 取消选中
    await checkBoxs.at(2).trigger('click');
    expect(tree.vm.getCheckedKeys().toString()).toBe('0_0_1');
  })
  it("测试默认属性", async () => {
    const tree = mount(Tree, {
      propsData: {
        treeData: initTreeData([2, 2, 2])
      }
    });
    // 默认显示foldIcon
    let foldIcons = getAllfoldIcon(tree);
    expect(foldIcons.length).toBe(6);
    // 默认显示checkBox
    let checkBoxs = getAllCheckBox(tree);
    expect(checkBoxs.length).toBe(14);
  });
  it("测试不显示折叠图标和checkbox", async () => {
    const tree = mount(Tree, {
      propsData: {
        treeData: initTreeData([2, 2, 2]),
        showFoldIcon: false,
        showCheckBox: false
      }
    });
    // 不显示foldIcon
    let foldIcons = getAllfoldIcon(tree);
    expect(foldIcons.length).toBe(0);
    // 不显示显示checkBox
    let checkBoxs = getAllCheckBox(tree);
    expect(checkBoxs.length).toBe(0);
  })
  it("测试设置属性值是否可以生效：defaultCheckedKeys，defaultExpandKeys， defaultDisabledKeys", async () => {
    // 这里使用await是保证 tree渲染完成, 测试时发现不用await expands 测试会失败，默认打开的节点处于未打开状态
    const tree = await mount(Tree, {
      propsData: {
        treeData: initTreeData([2, 2, 2]),
        showFoldIcon: true,
        showCheckBox: true,
        defaultCheckedKeys: ['0_0_1'],
        defaultExpandKeys: ['0_0_1'],
        defaultDisabledKeys: ['1_0_1']
      }
    });
    // 设置一个节点默认选中
    let checkBoxs = getAllCheckedNode(tree);
    expect(checkBoxs.length).toBeGreaterThanOrEqual(1);
    expect(tree.vm.getCheckedKeys().toString()).toBe('0_0_1');
    // 设置一个节点expand 默认打开
    let expands =  getAllExpandNode(tree)
    expect(expands.length).toBe(2);
    // 设置disabled的节点
    let disableds =  getAllDisabledNode(tree)
    expect(disableds.length).toBe(1);
  })
  it("测试自定义树节点", async () => {
    const tree = await mount(Tree, {
      propsData: {
        treeData: initTreeData([2, 2, 2]),
        renderContent: (h, { node })=> {
          return (
            <span class="custom-tree-node">
              <span class="tree-text" >{node.label}</span>
              <span class="tree-node-btn">
                <button on-click={ (event) => addNode(event, node) }>Add</button>
                <button on-click={ (event) => delNode(event, node) }>Del</button>
              </span>
            </span>
          );
        }
      }
    });
    function addNode(event, node) {
      eventUtil.stopPropagation(event);
      let id = node.id + "_" + node.children.length;
      let newNode = {
        id: id,
        label: "子级" + id,
        children: [],
        checked: 0,
        parent: node,
      };
      node.children.push(newNode);
    }
    function delNode(event, node) {
      eventUtil.stopPropagation(event);
      const children = node.parent.children;
      const index = children.findIndex((d) => d.id === node.id);
      children.splice(index, 1);
    }
    expect(tree.text()).toEqual(expect.not.stringContaining('子级0_0_2'));
    let addBtn = getAllAddBtn(tree).at(1);
    await addBtn.trigger('click');
    expect(tree.text()).toEqual(expect.stringContaining('子级0_0_2'));
    let delBtn = getAllDelBtn(tree).at(4);
    await delBtn.trigger('click');
    expect(tree.text()).toEqual(expect.not.stringContaining('子级0_0_2'));
  })
})
function getAllCheckBox(tree) {
  return tree.findAll("div[class='inline-block check-box'] span");
}
function getAllfoldIcon(tree) {
  return tree.findAll("span[class~='fold-icon']");
}
function getAllDisabledNode(tree) {
  return tree.findAll("span[class='icon iconfont icon-size iconfangkuang disabled-two']");
}
function getAllExpandNode(tree) {
  return tree.findAll("span[class='icon iconfont icontriangle-down fold-icon']");
}
function getAllCheckedNode(tree) {
  return tree.findAll("span[class='icon iconfont icon-size iconweibiaoti-_xuanzhong blue-color']");
}
function getAllAddBtn(tree) {
  return tree.findAll("span[class='tree-node-btn'] button:nth-of-type(1)");
}
function getAllDelBtn(tree) {
  return tree.findAll("span[class='tree-node-btn'] button:nth-of-type(2)");
}
function initTreeData(arr) {
  let treeData = [];
  const setChildren = (obj, arr, index) => {
    if (index >= arr.length) return;
    for (let j = 0; j < arr[index]; j++) {
      let id = obj.id + "_" + j;
      let child = {
        id: id,
        label: "子级" + id,
        children: [],
      };
      setChildren(child, arr, index + 1);
      obj.children.push(child);
    }
  };
  if (arr.length < 1) return;
  for (let i = 0; i < arr[0]; i++) {
    let obj = {
      id: i.toString(),
      label: "父级" + i,
      children: [],
    };
    setChildren(obj, arr, 1);
    treeData.push(obj);
  }
  return treeData;
}