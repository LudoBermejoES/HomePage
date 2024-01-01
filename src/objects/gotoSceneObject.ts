interface Props {
  onEnterArea: CallableFunction;
  onLeaveArea: CallableFunction;
}

export default class GotoSceneObject {
  onEnterArea: CallableFunction;
  onLeaveArea: CallableFunction;
  constructor(config: Props) {
    this.onEnterArea = config.onEnterArea;
    this.onLeaveArea = config.onLeaveArea;
  }
}
