import {StateManager, Tools} from './model/state-manager.js';
import {Durations} from './constants.js';

const sm = new StateManager();
sm.onChange(state => {
  const counts = state.score.measures.map(m => m.symbols.map(s => s.id));
  console.log('change', {tool: state.currentTool, active: state.activeSymbolId, measures: counts});
});

sm.setTool(Tools.NOTE);
sm.beginSymbolCreation({id: 'n1', midi: 60, duration: Durations.QUARTER, index: 0});
sm.updateActiveSymbol(0, 2);
sm.commitActiveSymbol();

sm.setTool(Tools.REST);
sm.beginSymbolCreation({id: 'r1', duration: Durations.QUARTER, index: 1});
sm.commitActiveSymbol();

sm.deleteSymbol('n1');
