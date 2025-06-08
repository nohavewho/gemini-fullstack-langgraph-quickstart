# Press Monitor Multi-Country Refactoring Plan

## Overview
Remove hardcoded Azerbaijan references and create a flexible multi-country press monitoring system with presets, custom selections, and enhanced features.

## Phase 1: Remove Hardcoded Country References

### 1.1 Backend Changes
- [ ] Update all prompts in `backend/src/agent/prompts.py` to use dynamic country variables
- [ ] Refactor `backend/src/agent/press_prompts.py` to accept country parameters
- [ ] Modify `backend/src/agent/language_agents.py` to handle multiple countries
- [ ] Update state management in `backend/src/agent/state.py` to support country lists
- [ ] Adjust tools and schemas in `backend/src/agent/tools_and_schemas.py`

### 1.2 Frontend Changes
- [ ] Add multi-select country dropdown component
- [ ] Create preset selector with common combinations
- [ ] Update InputForm to handle country selection
- [ ] Modify API calls to pass selected countries

## Phase 2: Multi-Country Selection System

### 2.1 Country Selection Features
- **Multi-select dropdown**: Allow selecting multiple countries
- **Search functionality**: Quick country search
- **Region grouping**: Group countries by region (Europe, Asia, etc.)
- **Popular countries**: Quick access to frequently used countries

### 2.2 Preset System
Default presets:
1. **Azerbaijan Focus** (default): Azerbaijan news in all countries
2. **Regional Analysis**: Caucasus region (Azerbaijan, Georgia, Armenia)
3. **CIS Countries**: Post-Soviet states coverage
4. **Global Major**: USA, UK, EU, China, Russia
5. **Custom Selection**: User-defined combinations

### 2.3 Query Types
- **About Country X**: News about selected country in all sources
- **In Country X**: News from selected country's sources
- **Cross-Reference**: News about Country X in Country Y
- **Regional Analysis**: News about/from multiple countries

## Phase 3: Enhanced Features

### 3.1 Audio Input Integration
- [ ] Add speech-to-text for query input
- [ ] Use Web Speech API or Google Cloud Speech
- [ ] Voice commands for country selection

### 3.2 Advanced Visualizations
- [ ] Integrate Google Charts API for dynamic charts
- [ ] Use Gemini's chart generation capabilities
- [ ] Create exportable report templates
- [ ] Add temporal trend visualizations
- [ ] Geographic heat maps for news coverage

### 3.3 Report Generation
- [ ] PDF export with charts and analysis
- [ ] Scheduled report generation
- [ ] Email delivery system
- [ ] Custom branding options

## Implementation Strategy

### Branch Strategy
```bash
main
├── feature/multi-country-refactor
│   ├── remove-hardcoded-refs
│   ├── add-country-selector
│   ├── implement-presets
│   └── enhance-features
```

### Testing Plan
1. Unit tests for each component
2. Integration tests for country selection flow
3. E2E tests for preset scenarios
4. Performance tests with multiple countries

### Migration Steps
1. Create feature branch
2. Implement backend changes with backward compatibility
3. Add frontend country selector
4. Test with existing Azerbaijan-only queries
5. Enable multi-country features
6. Add enhanced features incrementally

## Technical Specifications

### API Changes
```typescript
// Current
interface Query {
  query: string;
  date_filter?: string;
}

// New
interface Query {
  query: string;
  countries?: string[];  // ISO country codes
  query_type?: 'about' | 'in' | 'cross-reference';
  source_countries?: string[];  // For cross-reference
  target_countries?: string[];  // For cross-reference
  date_filter?: string;
  preset?: string;
}
```

### Database Schema Updates
```sql
-- Add country configuration table
CREATE TABLE country_presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  countries JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update queries table
ALTER TABLE queries 
ADD COLUMN countries JSONB,
ADD COLUMN query_type VARCHAR(50);
```

### Component Structure
```
frontend/src/components/
├── CountrySelector/
│   ├── CountryMultiSelect.tsx
│   ├── PresetSelector.tsx
│   └── RegionGroups.tsx
├── AudioInput/
│   └── VoiceRecorder.tsx
└── Reports/
    ├── ChartGenerator.tsx
    └── ReportExporter.tsx
```

## Timeline
- **Week 1**: Backend refactoring, remove hardcoded references
- **Week 2**: Frontend country selector implementation
- **Week 3**: Preset system and testing
- **Week 4**: Enhanced features (audio, charts)

## Risks and Mitigation
1. **API Rate Limits**: Implement caching for multi-country queries
2. **Performance**: Use pagination and lazy loading
3. **Complexity**: Incremental rollout with feature flags
4. **Backward Compatibility**: Maintain support for existing queries