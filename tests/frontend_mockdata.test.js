import test from 'node:test';
import assert from 'node:assert';
import { MOCK_REPORTS } from '../src/data/mockData.js';

test('mock reports integrity and non-diagnostic structure', () => {
  assert.ok(Array.isArray(MOCK_REPORTS), 'MOCK_REPORTS must be an array');
  assert.ok(MOCK_REPORTS.length >= 4, 'Must have at least 4 sample reports');

  for (const report of MOCK_REPORTS) {
    assert.ok(report.id, 'Report must have an id');
    assert.ok(report.title, 'Report must have a title');
    assert.ok(report.date, 'Report must have a date');
    assert.ok(report.summary, 'Report must have a patient summary');
    assert.ok(Array.isArray(report.parameters), 'Report must contain parameters array');
    assert.ok(report.parameters.length > 0, 'Report must have at least one parameter');

    // Check parameters
    for (const param of report.parameters) {
      assert.ok(param.name, 'Parameter must have a name');
      assert.ok(param.value !== undefined, 'Parameter must have a value');
      assert.ok(param.unit, 'Parameter must have a unit');
      assert.ok(param.status, 'Parameter must have a status');
      assert.ok(typeof param.value === 'number', 'Parameter value must be a number');
    }

    // Check non-diagnostic explanation structure
    assert.ok(report.aiExplanation, 'Report must have aiExplanation');
    assert.ok(report.aiExplanation.headline, 'Explanation must have a headline');
    assert.ok(report.aiExplanation.overview, 'Explanation must have an overview');
    assert.ok(Array.isArray(report.aiExplanation.keyTakeaways), 'Takeaways must be array');
    assert.ok(Array.isArray(report.aiExplanation.questionsForDoctor), 'Questions must be array');
  }
});
