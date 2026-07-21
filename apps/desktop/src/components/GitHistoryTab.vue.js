import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useGitStore } from '../stores/git';
const props = defineProps();
const store = useGitStore();
const search = ref('');
function formatDate(value) {
    return new Date(value).toLocaleString();
}
function closeDetails() {
    store.selected = null;
    store.files = [];
}
onMounted(() => store.load(props.projectId));
onBeforeUnmount(() => store.stop());
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "phase-panel" },
});
/** @type {__VLS_StyleScopedClasses['phase-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-heading" },
});
/** @type {__VLS_StyleScopedClasses['tab-heading']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.store.sync(__VLS_ctx.projectId));
            // @ts-ignore
            [store, projectId,];
        } },
    ...{ class: "button primary" },
    disabled: (__VLS_ctx.store.project?.gitSyncStatus === 'SYNCING'),
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
(__VLS_ctx.store.project?.gitSyncStatus === 'SYNCING' ? 'Syncing…' : 'Sync Git History');
if (__VLS_ctx.store.error || __VLS_ctx.store.project?.gitSyncError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert error-alert" },
    });
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['error-alert']} */ ;
    (__VLS_ctx.store.error || __VLS_ctx.store.project?.gitSyncError);
}
if (__VLS_ctx.store.project) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "metadata-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['metadata-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.store.project.gitCurrentBranch || 'Unknown');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.store.project.gitHeadHash?.slice(0, 8) || '—');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.store.project.gitCommitCount);
}
if (__VLS_ctx.store.progress && (__VLS_ctx.store.project?.gitSyncStatus === 'SYNCING' || __VLS_ctx.store.progress.status === 'FAILED')) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
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
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "commit-toolbar" },
});
/** @type {__VLS_StyleScopedClasses['commit-toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onKeyup: (...[$event]) => {
            return (__VLS_ctx.store.load(__VLS_ctx.projectId, __VLS_ctx.search));
            // @ts-ignore
            [store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, store, projectId, search,];
        } },
    ...{ class: "wide-input" },
    placeholder: "Search by message, author, hash, or file…",
});
(__VLS_ctx.search);
/** @type {__VLS_StyleScopedClasses['wide-input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.store.load(__VLS_ctx.projectId, __VLS_ctx.search));
            // @ts-ignore
            [store, projectId, search, search,];
        } },
    ...{ class: "button secondary" },
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
if (!__VLS_ctx.store.loading && __VLS_ctx.store.commits.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "file-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['file-empty']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "memory-list commit-list" },
    });
    /** @type {__VLS_StyleScopedClasses['memory-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['commit-list']} */ ;
    for (const [commit] of __VLS_vFor((__VLS_ctx.store.commits))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.store.loading && __VLS_ctx.store.commits.length === 0))
                        throw 0;
                    return (__VLS_ctx.store.open(__VLS_ctx.projectId, commit.id));
                    // @ts-ignore
                    [store, store, store, store, projectId,];
                } },
            key: (commit.id),
            ...{ class: "commit-card" },
        });
        /** @type {__VLS_StyleScopedClasses['commit-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
        (commit.shortHash);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (commit.subject);
        __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
        (commit.authorName);
        (__VLS_ctx.formatDate(commit.committedAt));
        (commit.filesChanged);
        (commit.insertions);
        (commit.deletions);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "commit-open-hint" },
        });
        /** @type {__VLS_StyleScopedClasses['commit-open-hint']} */ ;
        // @ts-ignore
        [formatDate,];
    }
}
if (__VLS_ctx.store.selected) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMousedown: (__VLS_ctx.closeDetails) },
        ...{ class: "commit-drawer-backdrop" },
    });
    /** @type {__VLS_StyleScopedClasses['commit-drawer-backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "commit-drawer" },
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': "commit-detail-title",
    });
    /** @type {__VLS_StyleScopedClasses['commit-drawer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "commit-drawer-header" },
    });
    /** @type {__VLS_StyleScopedClasses['commit-drawer-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    (__VLS_ctx.store.selected.shortHash);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeDetails) },
        ...{ class: "icon-button" },
        'aria-label': "Close commit details",
    });
    /** @type {__VLS_StyleScopedClasses['icon-button']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "commit-drawer-content" },
    });
    /** @type {__VLS_StyleScopedClasses['commit-drawer-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: "commit-detail-title",
    });
    (__VLS_ctx.store.selected.subject);
    if (__VLS_ctx.store.selected.body) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "commit-body" },
        });
        /** @type {__VLS_StyleScopedClasses['commit-body']} */ ;
        (__VLS_ctx.store.selected.body);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.dl, __VLS_intrinsics.dl)({
        ...{ class: "commit-facts" },
    });
    /** @type {__VLS_StyleScopedClasses['commit-facts']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.store.selected.authorName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.formatDate(__VLS_ctx.store.selected.committedAt));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    (__VLS_ctx.store.selected.hash);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dt, __VLS_intrinsics.dt)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.dd, __VLS_intrinsics.dd)({});
    (__VLS_ctx.store.selected.parentHashes.map(hash => hash.slice(0, 8)).join(', ') || 'None');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "changed-files-heading" },
    });
    /** @type {__VLS_StyleScopedClasses['changed-files-heading']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.store.files.length);
    (__VLS_ctx.store.files.length === 1 ? 'file' : 'files');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "change-totals" },
    });
    /** @type {__VLS_StyleScopedClasses['change-totals']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "additions" },
    });
    /** @type {__VLS_StyleScopedClasses['additions']} */ ;
    (__VLS_ctx.store.selected.insertions);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "deletions" },
    });
    /** @type {__VLS_StyleScopedClasses['deletions']} */ ;
    (__VLS_ctx.store.selected.deletions);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "drawer-file-list" },
    });
    /** @type {__VLS_StyleScopedClasses['drawer-file-list']} */ ;
    for (const [file] of __VLS_vFor((__VLS_ctx.store.files))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (file.id),
            ...{ class: "drawer-file-row" },
        });
        /** @type {__VLS_StyleScopedClasses['drawer-file-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "change-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['change-badge']} */ ;
        (file.changeType);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "drawer-file-path" },
        });
        /** @type {__VLS_StyleScopedClasses['drawer-file-path']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
        (file.relativePath);
        if (file.previousPath) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
            (file.previousPath);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "file-change-count" },
        });
        /** @type {__VLS_StyleScopedClasses['file-change-count']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.b, __VLS_intrinsics.b)({});
        (file.insertions ?? 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
        (file.deletions ?? 0);
        // @ts-ignore
        [store, store, store, store, store, store, store, store, store, store, store, store, store, store, formatDate, closeDetails, closeDetails,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
