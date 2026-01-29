import { CardItem } from './types';

export const mockCards: CardItem[] = [
  {
    id: '1',
    type: 'video',
    bilibiliId: 'BV1GJ411x7h7',
    summary: '来自《我的大叔》的经典片段',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: '2',
    type: 'text',
    summary: '我们终究要学会和自己和解。',
    content: '我们终究要学会和自己和解。接受自己的不完美，接受生活中的遗憾。这才是成长的开始。',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: '3',
    type: 'mixed',
    bilibiliId: 'BV1uW4y1D7hJ',
    summary: '《黑暗荣耀》中关于复仇与治愈的台词',
    content: '我做梦都梦到过这一刻，我等待了18年。不是想原谅你，而是想亲手撕碎你的人生。但最终，我发现，真正的复仇是过好自己的人生。',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: '4',
    type: 'text',
    summary: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。',
    content: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。但无论是什么味道，都是你人生的一部分。',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: '5',
    type: 'video',
    bilibiliId: 'BV1Bv411u7rS',
    summary: '《请回答1988》温暖的邻里之情',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: '6',
    type: 'mixed',
    bilibiliId: 'BV1N341167Uv',
    summary: '《机智的医生生活》关于友情与梦想',
    content: '人活着最重要的不是别人怎么看你，而是你怎么看你自己。做自己喜欢的事，爱自己爱的人，这就是幸福。',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: '7',
    type: 'text',
    summary: '有时候，最遥远的距离不是生与死，而是我站在你面前，你却不知道我爱你。',
    content: '有时候，最遥远的距离不是生与死，而是我站在你面前，你却不知道我爱你。这就是暗恋，苦涩却美丽。',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: '8',
    type: 'mixed',
    bilibiliId: 'BV1pK411G78L',
    summary: '《鱿鱼游戏》关于人性与生存',
    content: '在绝境中，人性被赤裸裸地暴露出来。但即便在最黑暗的时刻，依然有人选择善良。这或许就是我们继续相信的理由。',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
];
