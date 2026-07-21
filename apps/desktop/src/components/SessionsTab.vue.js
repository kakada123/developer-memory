import { onMounted, ref } from 'vue';
import { useSessionsStore } from '../stores/sessions';
const props = defineProps(), store = useSessionsStore(), title = ref(''), summary = ref('');
onMounted(() => store.load(props.projectId));
async function create() { if (!title.value.trim())
    return; await store.create(props.projectId, title.value, summary.value); title.value = ''; summary.value = ''; }
function remove(id) { if (window.confirm('Delete this session and unlink its memories?'))
    void store.remove(props.projectId, id); } // @ts-ignore
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
if (__VLS_ctx.store.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert error-alert" },
    });
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['error-alert']} */ ;
    (__VLS_ctx.store.error);
}
if (!__VLS_ctx.store.active) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.create) },
        ...{ class: "inline-form" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        maxlength: "200",
        placeholder: "Session title",
        required: true,
    });
    (__VLS_ctx.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        placeholder: "Optional summary",
    });
    (__VLS_ctx.summary);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "button primary" },
    });
    /** @type {__VLS_StyleScopedClasses['button']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
}
for (const [s] of __VLS_vFor((__VLS_ctx.store.items))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        key: (s.id),
        ...{ class: "memory-card" },
    });
    /** @type {__VLS_StyleScopedClasses['memory-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "record-type" },
    });
    /** @type {__VLS_StyleScopedClasses['record-type']} */ ;
    (s.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (s.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (s.summary);
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    (new Date(s.startedAt).toLocaleString());
    (s.branchName || 'No branch');
    (s.durationMinutes ?? 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "record-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['record-actions']} */ ;
    if (s.status === 'ACTIVE') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(s.status === 'ACTIVE'))
                        throw 0;
                    return (__VLS_ctx.store.action(__VLS_ctx.projectId, s.id, 'pause'));
                    // @ts-ignore
                    [store, store, store, store, store, create, title, summary, projectId,];
                } },
        });
    }
    if (s.status === 'PAUSED') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(s.status === 'PAUSED'))
                        throw 0;
                    return (__VLS_ctx.store.action(__VLS_ctx.projectId, s.id, 'resume'));
                    // @ts-ignore
                    [store, projectId,];
                } },
        });
    }
    if (s.status !== 'COMPLETED') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(s.status !== 'COMPLETED'))
                        throw 0;
                    return (__VLS_ctx.store.action(__VLS_ctx.projectId, s.id, 'complete'));
                    // @ts-ignore
                    [store, projectId,];
                } },
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.remove(s.id));
                // @ts-ignore
                [remove,];
            } },
    });
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
