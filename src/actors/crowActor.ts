/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Think, ArriveBehavior } from 'yuka';
import { RestEvaluator, GatherEvaluator } from './evaluators/crowEvaluators';
import { Actor } from './actor.js';

export class CrowActor extends Actor {
  constructor() {
    super();

    this.maxTurnRate = Math.PI * 0.5;
    this.maxSpeed = 1.5;

    this.anims.play('IDLE', true);

    // goal-driven agent design

    this.brain = new Think(this);

    this.brain.addEvaluator(new RestEvaluator());
    this.brain.addEvaluator(new GatherEvaluator());

    // steering

    const arriveBehavior = new ArriveBehavior();
    arriveBehavior.deceleration = 1.5;
  }

  tired(): boolean {
    return true;
  }
}
