// Field Mapping Step Component
// Handles drag-and-drop field mapping between CSV and database fields

window.Components = window.Components || {};

window.Components.FieldMappingStep = function({
    jobId,
    onMapping
}) {
    const { TrendingUp, CheckCircle, AlertCircle, RefreshCw } = window.Icons;

    const [csvFields, setCsvFields] = React.useState([]);
    const [dbFields, setDbFields] = React.useState([]);
    const [fieldMapping, setFieldMapping] = React.useState({});
    const [autoMapped, setAutoMapped] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [draggedField, setDraggedField] = React.useState(null);

    // Load fields when component mounts
    React.useEffect(() => {
        if (jobId) {
            loadFields();
        }
    }, [jobId]);

    const loadFields = async () => {
        try {
            const response = await fetch(`/api/data-loader/fields/${jobId}`);
            if (response.ok) {
                const data = await response.json();
                setCsvFields(data.csvFields);
                setDbFields(data.dbFields);
                
                // Auto-map fields
                const autoMapping = autoMapFields(data.csvFields, data.dbFields);
                setAutoMapped(autoMapping);
                setFieldMapping(autoMapping);
                
                // Save auto-mapping to backend
                if (Object.keys(autoMapping).length > 0) {
                    saveMapping(autoMapping);
                }
            } else {
                const error = await response.json();
                alert(`Failed to load fields: ${error.error}`);
            }
        } catch (error) {
            console.error('Error loading fields:', error);
            alert(`Failed to load fields: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const saveMapping = async (mapping, forceSave = false) => {
        // Don't save empty mappings unless explicitly clearing
        if (Object.keys(mapping).length === 0 && !forceSave) {
            console.log('Skipping save of empty mapping');
            return;
        }
        
        try {
            const response = await fetch(`/api/data-loader/mapping/${jobId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fieldMapping: mapping })
            });
            
            if (!response.ok) {
                console.error('Failed to save mapping');
            }
        } catch (error) {
            console.error('Error saving mapping:', error);
        }
    };

    // Auto-mapping algorithm
    const autoMapFields = (csvFields, dbFields) => {
        const mapping = {};
        
        csvFields.forEach(csvField => {
            const normalizedCsv = csvField.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Find best match
            const bestMatch = dbFields.find(dbField => {
                const normalizedDb = dbField.toLowerCase().replace(/[^a-z0-9]/g, '');
                return normalizedCsv === normalizedDb || 
                       normalizedCsv.includes(normalizedDb) || 
                       normalizedDb.includes(normalizedCsv);
            });
            
            if (bestMatch) {
                mapping[csvField] = bestMatch;
            }
        });
        
        return mapping;
    };

    const handleDragStart = (e, csvField) => {
        setDraggedField(csvField);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dbField) => {
        e.preventDefault();
        if (draggedField) {
            const newMapping = { ...fieldMapping };
            newMapping[draggedField] = dbField;
            setFieldMapping(newMapping);
            setDraggedField(null);
            
            // Save mapping immediately
            saveMapping(newMapping);
        }
    };

    const handleRemoveMapping = (csvField) => {
        const newMapping = { ...fieldMapping };
        delete newMapping[csvField];
        setFieldMapping(newMapping);
        
        // Save mapping immediately
        saveMapping(newMapping);
    };

    const handleAutoMap = () => {
        setFieldMapping(autoMapped);
        saveMapping(autoMapped);
    };

    const handleClearAll = () => {
        setFieldMapping({});
        // Explicitly clear the mapping in the backend
        saveMapping({}, true);
    };

    const handleNext = () => {
        if (onMapping) {
            onMapping(fieldMapping);
        }
    };

    const getMappedDbField = (csvField) => {
        return fieldMapping[csvField] || null;
    };

    const getUnmappedCsvFields = () => {
        return csvFields.filter(csvField => !fieldMapping[csvField]);
    };

    const getUnmappedDbFields = () => {
        const mappedFields = Object.values(fieldMapping);
        return dbFields.filter(dbField => !mappedFields.includes(dbField));
    };

    if (loading) {
        return React.createElement('div', {
            className: 'flex items-center justify-center py-12'
        }, [
            React.createElement(RefreshCw, {
                key: 'loading-spinner',
                size: 32,
                className: 'animate-spin text-blue-600'
            }),
            React.createElement('span', {
                key: 'loading-text',
                className: 'ml-3 text-gray-600 dark:text-gray-400'
            }, 'Loading fields...')
        ]);
    }

    return React.createElement('div', {
        className: 'space-y-6'
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            className: 'text-center'
        }, [
            React.createElement('h3', {
                key: 'title',
                className: 'text-lg font-medium text-gray-900 dark:text-white mb-2'
            }, 'Map CSV Fields to Database Fields'),
            React.createElement('p', {
                key: 'description',
                className: 'text-gray-600 dark:text-gray-400'
            }, 'Drag CSV fields to the corresponding database fields, or use auto-mapping')
        ]),

        // Auto-mapping controls
        React.createElement('div', {
            key: 'controls',
            className: 'flex justify-center gap-3'
        }, [
            React.createElement('button', {
                key: 'auto-map-btn',
                onClick: handleAutoMap,
                className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
            }, [
                React.createElement(CheckCircle, { key: 'auto-icon', size: 16 }),
                React.createElement('span', { key: 'auto-text' }, 'Auto-Map Fields')
            ]),
            React.createElement('button', {
                key: 'clear-btn',
                onClick: handleClearAll,
                className: 'px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
            }, 'Clear All')
        ]),

        // Mapping area
        React.createElement('div', {
            key: 'mapping-area',
            className: 'grid grid-cols-2 gap-6'
        }, [
            // CSV Fields
            React.createElement('div', {
                key: 'csv-fields',
                className: 'space-y-3'
            }, [
                React.createElement('h4', {
                    key: 'csv-title',
                    className: 'font-medium text-gray-900 dark:text-white'
                }, 'CSV Fields'),
                React.createElement('div', {
                    key: 'csv-list',
                    className: 'space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2'
                }, csvFields.map(csvField => {
                    const mappedDbField = getMappedDbField(csvField);
                    const isUnmapped = !mappedDbField;
                    
                    return React.createElement('div', {
                        key: csvField,
                        draggable: true,
                        onDragStart: (e) => handleDragStart(e, csvField),
                        className: `p-3 border rounded-lg cursor-move transition-colors ${
                            isUnmapped 
                                ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800' 
                                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        }`
                    }, [
                        React.createElement('div', {
                            key: 'field-content',
                            className: 'flex items-center justify-between'
                        }, [
                            React.createElement('span', {
                                key: 'field-name',
                                className: 'font-medium text-gray-900 dark:text-white'
                            }, csvField),
                            mappedDbField && React.createElement('button', {
                                key: 'remove-btn',
                                onClick: () => handleRemoveMapping(csvField),
                                className: 'text-red-600 hover:text-red-700 transition-colors'
                            }, '×')
                        ]),
                        mappedDbField && React.createElement('div', {
                            key: 'mapped-info',
                            className: 'mt-2 text-sm text-blue-600 dark:text-blue-400'
                        }, [
                            React.createElement(TrendingUp, { key: 'arrow', size: 14, className: 'inline mr-1' }),
                            React.createElement('span', { key: 'mapped-text' }, `Mapped to: ${mappedDbField}`)
                        ])
                    ]);
                }))
            ]),

            // Database Fields
            React.createElement('div', {
                key: 'db-fields',
                className: 'space-y-3'
            }, [
                React.createElement('h4', {
                    key: 'db-title',
                    className: 'font-medium text-gray-900 dark:text-white'
                }, 'Database Fields'),
                React.createElement('div', {
                    key: 'db-list',
                    className: 'space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2'
                }, dbFields.map(dbField => {
                    const isMapped = Object.values(fieldMapping).includes(dbField);
                    const mappedCsvField = Object.keys(fieldMapping).find(csvField => fieldMapping[csvField] === dbField);
                    
                    return React.createElement('div', {
                        key: dbField,
                        onDragOver: handleDragOver,
                        onDrop: (e) => handleDrop(e, dbField),
                        className: `p-3 border rounded-lg transition-colors ${
                            isMapped 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400'
                        }`
                    }, [
                        React.createElement('div', {
                            key: 'field-content',
                            className: 'flex items-center justify-between'
                        }, [
                            React.createElement('span', {
                                key: 'field-name',
                                className: 'font-medium text-gray-900 dark:text-white'
                            }, dbField),
                            isMapped && React.createElement(CheckCircle, {
                                key: 'check-icon',
                                size: 16,
                                className: 'text-green-600'
                            })
                        ]),
                        isMapped && React.createElement('div', {
                            key: 'mapped-info',
                            className: 'mt-2 text-sm text-green-600 dark:text-green-400'
                        }, `Mapped from: ${mappedCsvField}`)
                    ]);
                }))
            ])
        ]),

        // Mapping summary
        React.createElement('div', {
            key: 'summary',
            className: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4'
        }, [
            React.createElement('div', {
                key: 'summary-header',
                className: 'flex items-center gap-2 mb-3'
            }, [
                React.createElement(AlertCircle, {
                    key: 'summary-icon',
                    size: 16,
                    className: 'text-blue-600'
                }),
                React.createElement('span', {
                    key: 'summary-title',
                    className: 'font-medium text-gray-900 dark:text-white'
                }, 'Mapping Summary')
            ]),
            React.createElement('div', {
                key: 'summary-stats',
                className: 'grid grid-cols-3 gap-4 text-sm'
            }, [
                React.createElement('div', {
                    key: 'total-csv',
                    className: 'text-center'
                }, [
                    React.createElement('div', {
                        key: 'total-csv-value',
                        className: 'font-medium text-gray-900 dark:text-white'
                    }, csvFields.length),
                    React.createElement('div', {
                        key: 'total-csv-label',
                        className: 'text-gray-500 dark:text-gray-400'
                    }, 'CSV Fields')
                ]),
                React.createElement('div', {
                    key: 'mapped',
                    className: 'text-center'
                }, [
                    React.createElement('div', {
                        key: 'mapped-value',
                        className: 'font-medium text-green-600'
                    }, Object.keys(fieldMapping).length),
                    React.createElement('div', {
                        key: 'mapped-label',
                        className: 'text-gray-500 dark:text-gray-400'
                    }, 'Mapped')
                ]),
                React.createElement('div', {
                    key: 'unmapped',
                    className: 'text-center'
                }, [
                    React.createElement('div', {
                        key: 'unmapped-value',
                        className: 'font-medium text-orange-600'
                    }, getUnmappedCsvFields().length),
                    React.createElement('div', {
                        key: 'unmapped-label',
                        className: 'text-gray-500 dark:text-gray-400'
                    }, 'Unmapped')
                ])
            ])
        ])
    ]);
};
