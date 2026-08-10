import { describe, expect, it } from 'vitest';
import { DEFERRED_MCP_TOOL_NAMES, MCP_TOOL_NAMES, MCP_TOOLS } from './tools.js';

describe('MCP tool registry', () => {
  it('exposes exactly the nine MVP tools (docs/38)', () => {
    expect(MCP_TOOL_NAMES).toHaveLength(9);
  });

  it('never exposes a deferred coordination tool (FIT-025)', () => {
    for (const deferred of DEFERRED_MCP_TOOL_NAMES) {
      expect(MCP_TOOL_NAMES).not.toContain(deferred);
    }
  });

  it('requires step-up only for the project authority action', () => {
    const stepUp = MCP_TOOL_NAMES.filter((name) => MCP_TOOLS[name].requiresStepUp);
    expect(stepUp).toEqual(['shoo.mark_canonical']);
  });

  it('requires expected_version on every lifecycle and lineage mutation', () => {
    expect(MCP_TOOLS['shoo.checkpoint_session'].requiresExpectedVersion).toBe(true);
    expect(MCP_TOOLS['shoo.complete_session'].requiresExpectedVersion).toBe(true);
    expect(MCP_TOOLS['shoo.supersede_memory'].requiresExpectedVersion).toBe(true);
    expect(MCP_TOOLS['shoo.mark_canonical'].requiresExpectedVersion).toBe(true);
  });

  it('states mutation impact in every tool description', () => {
    for (const name of MCP_TOOL_NAMES) {
      expect(MCP_TOOLS[name].description.length).toBeGreaterThan(40);
    }
  });

  it('carries no predecessor product namespace (FIT-002)', () => {
    expect(MCP_TOOL_NAMES.join(',').toLowerCase()).not.toMatch(/kage|sensei/);
  });
});
