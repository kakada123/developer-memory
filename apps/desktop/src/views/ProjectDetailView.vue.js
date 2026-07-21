import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useIndexingStore } from '../stores/indexing';
import GitHistoryTab from '../components/GitHistoryTab.vue';
import SessionsTab from '../components/SessionsTab.vue';
import MemoriesTab from '../components/MemoriesTab.vue';
const props = defineProps();
const store = useIndexingStore();
const activeTab = ref('overview');
function formatDate(value) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Never';
}
function formatSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
async function clearIndex() {
    if (window.confirm('Clear all indexed files for this project? The project registration will remain.')) {
        await store.clear(props.projectId);
    }
}
onMounted(() => store.load(props.projectId));
onBeforeUnmount(() => store.reset());
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "detail-page" },
});
/** @type {__VLS_StyleScopedClasses['detail-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "back-link" },
    href: "#/",
});
/** @type {__VLS_StyleScopedClasses['back-link']} */ ;
if (__VLS_ctx.store.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert error-alert" },
    });
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['error-alert']} */ ;
    (__VLS_ctx.store.error);
}
if (__VLS_ctx.store.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-panel" },
    });
    /** @type {__VLS_StyleScopedClasses['status-panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "spinner" },
    });
    /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
}
else if (__VLS_ctx.store.project) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "project-hero" },
    });
    /** @type {__VLS_StyleScopedClasses['project-hero']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    (__VLS_ctx.store.project.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "hero-path" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-path']} */ ;
    (__VLS_ctx.store.project.path);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.store.loading))
                    throw 0;
                if (!(__VLS_ctx.store.project))
                    throw 0;
                return (__VLS_ctx.store.start(__VLS_ctx.projectId));
                // @ts-ignore
                [store, store, store, store, store, store, store, projectId,];
            } },
        ...{ class: "button primary" },
        disabled: (__VLS_ctx.store.isIndexing),
    });
    /** @type {__VLS_StyleScopedClasses['button']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    (__VLS_ctx.store.isIndexing ? 'Indexing…' : __VLS_ctx.store.project.indexStatus === 'NOT_INDEXED' ? 'Index Project' : 'Re-index');
    if (__VLS_ctx.store.project.indexStatus !== 'NOT_INDEXED') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.clearIndex) },
            ...{ class: "button danger" },
            disabled: (__VLS_ctx.store.isIndexing),
        });
        /** @type {__VLS_StyleScopedClasses['button']} */ ;
        /** @type {__VLS_StyleScopedClasses['danger']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "detail-tabs" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
    for (const [tab] of __VLS_vFor(['overview', 'files', 'git', 'sessions', 'memories'])) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.store.loading))
                        throw 0;
                    if (!(__VLS_ctx.store.project))
                        throw 0;
                    return (__VLS_ctx.activeTab = tab);
                    // @ts-ignore
                    [store, store, store, store, store, clearIndex, activeTab,];
                } },
            key: (tab),
            ...{ class: ({ active: __VLS_ctx.activeTab === tab }) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        (tab === 'git' ? 'Git History' : tab[0]?.toUpperCase() + tab.slice(1));
        // @ts-ignore
        [activeTab,];
    }
    if (__VLS_ctx.activeTab === 'overview') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "metadata-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['metadata-grid']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.project.framework ?? 'Unknown');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.project.language ?? 'Unknown');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.project.hasGit ? 'Repository' : 'Not detected');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: (`status-${__VLS_ctx.store.project.indexStatus.toLowerCase()}`) },
        });
        (__VLS_ctx.store.project.indexStatus.replaceAll('_', ' '));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.formatDate(__VLS_ctx.store.project.lastIndexedAt));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.project.indexedFileCount);
    }
    if (__VLS_ctx.activeTab === 'files' && __VLS_ctx.store.progress && (__VLS_ctx.store.isIndexing || __VLS_ctx.store.progress.status === 'FAILED')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "progress-panel" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-panel']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-heading" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-heading']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.progress.message);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.store.progress.percentage);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-track" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-track']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: ({ width: `${__VLS_ctx.store.progress.percentage}%` }) },
        });
        if (__VLS_ctx.store.progress.currentFile) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (__VLS_ctx.store.progress.currentFile);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
        (__VLS_ctx.store.progress.processedFiles);
        (__VLS_ctx.store.progress.totalFiles);
    }
    if (__VLS_ctx.store.project.indexError) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert error-alert" },
        });
        /** @type {__VLS_StyleScopedClasses['alert']} */ ;
        /** @type {__VLS_StyleScopedClasses['error-alert']} */ ;
        (__VLS_ctx.store.project.indexError);
    }
    if (__VLS_ctx.activeTab === 'files' && __VLS_ctx.store.result) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "result-summary" },
        });
        /** @type {__VLS_StyleScopedClasses['result-summary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.result.indexedFiles);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.result.updatedFiles);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.result.unchangedFiles);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.result.deletedFiles);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.result.skippedFiles);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.store.result.durationMs);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    if (__VLS_ctx.activeTab === 'files') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "file-browser" },
        });
        /** @type {__VLS_StyleScopedClasses['file-browser']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "file-browser-header" },
        });
        /** @type {__VLS_StyleScopedClasses['file-browser-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "eyebrow" },
        });
        /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "file-filters" },
        });
        /** @type {__VLS_StyleScopedClasses['file-filters']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "search",
            placeholder: "Search paths…",
        });
        (__VLS_ctx.store.search);
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.store.language),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
        });
        for (const [item] of __VLS_vFor((__VLS_ctx.store.languages))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (item),
                value: (item),
            });
            (item);
            // @ts-ignore
            [store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, activeTab, activeTab, activeTab, activeTab, formatDate,];
        }
        if (__VLS_ctx.store.files.length === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "file-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['file-empty']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "file-layout" },
            });
            /** @type {__VLS_StyleScopedClasses['file-layout']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "file-list" },
            });
            /** @type {__VLS_StyleScopedClasses['file-list']} */ ;
            for (const [file] of __VLS_vFor((__VLS_ctx.store.filteredFiles))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.store.loading))
                                throw 0;
                            if (!(__VLS_ctx.store.project))
                                throw 0;
                            if (!(__VLS_ctx.activeTab === 'files'))
                                throw 0;
                            if (!!(__VLS_ctx.store.files.length === 0))
                                throw 0;
                            return (__VLS_ctx.store.openFile(__VLS_ctx.projectId, file.id));
                            // @ts-ignore
                            [store, store, store, projectId,];
                        } },
                    key: (file.id),
                    ...{ class: ({ selected: __VLS_ctx.store.selectedFile?.id === file.id }) },
                });
                /** @type {__VLS_StyleScopedClasses['selected']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "file-path" },
                });
                /** @type {__VLS_StyleScopedClasses['file-path']} */ ;
                (file.relativePath);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "file-stats" },
                });
                /** @type {__VLS_StyleScopedClasses['file-stats']} */ ;
                (file.language ?? 'Text');
                (__VLS_ctx.formatSize(file.sizeBytes));
                (file.lineCount);
                (__VLS_ctx.formatDate(file.indexedAt));
                // @ts-ignore
                [store, formatDate, formatSize,];
            }
            if (__VLS_ctx.store.filteredFiles.length === 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "no-results" },
                });
                /** @type {__VLS_StyleScopedClasses['no-results']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "file-preview" },
            });
            /** @type {__VLS_StyleScopedClasses['file-preview']} */ ;
            if (__VLS_ctx.store.selectedFile) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "preview-title" },
                });
                /** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (__VLS_ctx.store.selectedFile.relativePath);
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.store.loading))
                                throw 0;
                            if (!(__VLS_ctx.store.project))
                                throw 0;
                            if (!(__VLS_ctx.activeTab === 'files'))
                                throw 0;
                            if (!!(__VLS_ctx.store.files.length === 0))
                                throw 0;
                            if (!(__VLS_ctx.store.selectedFile))
                                throw 0;
                            return (__VLS_ctx.store.selectedFile = null);
                            // @ts-ignore
                            [store, store, store, store,];
                        } },
                    ...{ class: "icon-button" },
                    'aria-label': "Close preview",
                });
                /** @type {__VLS_StyleScopedClasses['icon-button']} */ ;
                if (__VLS_ctx.store.selectedFile.content !== null) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
                    (__VLS_ctx.store.selectedFile.content);
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "preview-unavailable" },
                    });
                    /** @type {__VLS_StyleScopedClasses['preview-unavailable']} */ ;
                }
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "preview-unavailable" },
                });
                /** @type {__VLS_StyleScopedClasses['preview-unavailable']} */ ;
            }
        }
    }
    if (__VLS_ctx.activeTab === 'git') {
        const __VLS_0 = GitHistoryTab;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            projectId: (__VLS_ctx.projectId),
        }));
        const __VLS_2 = __VLS_1({
            projectId: (__VLS_ctx.projectId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    if (__VLS_ctx.activeTab === 'sessions') {
        const __VLS_5 = SessionsTab;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            projectId: (__VLS_ctx.projectId),
        }));
        const __VLS_7 = __VLS_6({
            projectId: (__VLS_ctx.projectId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
    if (__VLS_ctx.activeTab === 'memories') {
        const __VLS_10 = MemoriesTab;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            projectId: (__VLS_ctx.projectId),
        }));
        const __VLS_12 = __VLS_11({
            projectId: (__VLS_ctx.projectId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    }
}
// @ts-ignore
[store, store, projectId, projectId, projectId, activeTab, activeTab, activeTab,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
