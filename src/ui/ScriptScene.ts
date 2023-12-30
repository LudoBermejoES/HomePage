import * as Hierarchy from '../assets/scripts/hierarchy.json';
import * as Script from '../assets/scripts/script.json';
import * as Objects from '../assets/scripts/objects.json';
import * as Definitions from '../assets/scripts/definitions.json';
import {
  TemplateObject,
  DialogObject,
  DialogTemplateAnimation
} from './Interfaces';
import {
  ChildrenEntity,
  DialogLine,
  ChildrenEntity1,
  ChildrenEntity2,
  ScriptDialog,
  Template,
  ObjectInterface
} from './Interfaces';

export class ScriptScene {
  sizeOfBlocks: number = 32;
  constructor() {}
  private getFlow(): ChildrenEntity | undefined {
    return Hierarchy.Children.find((child) => child.TechnicalName === 'Flow');
  }
  getAnims(key: string): DialogTemplateAnimation | undefined {
    const object: ObjectInterface | undefined = (
      Objects.Objects as ObjectInterface[]
    ).find((object) => object.Properties.TechnicalName === key);

    if (!object) return;
    const anims: DialogLine = object.Template.DialogLine;
    Object.keys(anims).forEach((key) => {
      const anim = Definitions.ObjectDefinitions.find(
        (def) => def.Type === key
      );
      if (anim) {
        const final = Object.keys(anim.Values).find((valueKey) => {
          if (anim.Values[valueKey] === anims[key]) {
            return true;
          }
          return false;
        });
        anims[key] = final || undefined;
      }
    });

    return anims;
  }

  getSceneChildren(scene: string): DialogObject[] {
    const flow: ChildrenEntity | undefined = this.getFlow();

    if (!flow) return [];
    const sceneDialogs: ChildrenEntity1 | undefined =
      flow.Children?.find(
        (child: ChildrenEntity1) => child.TechnicalName === scene
      ) || undefined;
    if (!sceneDialogs || !sceneDialogs.Children) return [];
    let dialogFinal: DialogObject[] = [];
    const dialogs: ScriptDialog[] = [];

    sceneDialogs.Children.forEach((dialog: ChildrenEntity2) => {
      const data: object = Script as object;
      const id: string = `${dialog.TechnicalName}.Text`;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const line = (data as unknown).default[id];
      line.id = dialog.TechnicalName;
      if (line) {
        dialogs.push(line);
      }
    });
    dialogFinal = dialogs.map((dialog) => {
      const data: DialogObject = {
        en: dialog.en.Text,
        es: dialog.es.Text,
        name: dialog.Context.split('Flow/')[1].split(': ')[0],
        template: this.getAnims(dialog.id)
      };
      return data;
    });
    return dialogFinal;
  }
}
