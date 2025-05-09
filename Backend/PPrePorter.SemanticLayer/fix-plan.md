# Comprehensive Fix for PPrePorter.SemanticLayer Compilation Errors

## Identified Issues

1. **Duplicate interface definitions**:
   - `IEntityMappingService` in both `ISemanticLayerServices.cs` and `IEntityMappingService.cs`
   - `IDataModelService` in `ISemanticLayerServices.cs` 
   - `ISqlTranslationService` in both `ISemanticLayerServices.cs` and `ISqlTranslationService.cs`
   - `ICacheService` in both `ISemanticLayerServices.cs`

2. **Ambiguous references**:
   - `QueryEntities` exists in both `Models.Entities` and `Models.Translation` namespaces

3. **Duplicate class definitions**:
   - `MetricDefinition`, `DimensionDefinition`, `Metric`, `Dimension`, `Filter`, `Sort`, `TimeRange` are defined in multiple places

4. **Missing implementations**:
   - `DataModelService` doesn't implement `GetRelationshipsAsync`
   - `DataModelService` has the wrong return type for `RefreshDataModelAsync`
   - `EntityMappingService` has various implementation issues
   - `MemoryCacheService` missing interface method implementations

5. **Missing types**:
   - `MappedSort` and `MappedFilter` classes are not defined
   - Various missing type references

## Fix Plan

1. **Create New Model Classes**:
   - Create proper `MappedEntities.cs` file with all mapping-related classes
   - Create updated versions of existing services that implement interfaces correctly

2. **Update References**:
   - Use fully qualified namespaces to resolve ambiguous references

3. **Fix Interface Implementations**:
   - Create updated services that properly implement all interface methods
   - Adjust return types to match interface declarations

4. **Consolidate Duplicate Definitions**:
   - Remove duplicate interface definitions, keeping only one version
   - Rename conflicting types with appropriate prefixes

5. **Create Missing Types**:
   - Add any missing model classes needed by the services

## Implementation Steps

1. Create updated model classes with proper namespaces
2. Create updated service implementations that fix all errors
3. Update project references to use the new implementations
4. Clean up duplicate definitions

This approach allows us to fix the errors incrementally while maintaining a functioning application.
