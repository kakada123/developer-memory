import { computed, onMounted, ref } from 'vue';
import { useMemoriesStore } from '../stores/memories';
const props = defineProps(), store = useMemoriesStore(), title = ref(''), content = ref(''), type = ref('NOTE'), query = ref(''), filter = ref('');
const shown = computed(() => store.items.filter(m => (!query.value || `${m.title} ${m.content} ${m.tags.join(' ')}`.toLowerCase().includes(query.value.toLowerCase())) && (!filter.value || m.type === filter.value)));
onMounted(() => store.load(props.projectId));
async function create() { if (!title.value.trim() || !content.value.trim())
    return; await store.create(props.projectId, { title: title.value, content: content.value, type: type.value }); title.value = ''; content.value = ''; } // @ts-ignore
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
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.create) },
    ...{ class: "memory-form" },
});
/** @type {__VLS_StyleScopedClasses['memory-form']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.type),
});
for (const [t] of __VLS_vFor((['NOTE', 'DECISION', 'BUG', 'TASK', 'SOLUTION', 'QUESTION', 'OUTCOME']))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (t),
    });
    (t);
    // @ts-ignore
    [store, store, create, type,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    maxlength: "200",
    placeholder: "Title",
    required: true,
});
(__VLS_ctx.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
    value: (__VLS_ctx.content),
    maxlength: "20000",
    placeholder: "What should be remembered?",
    required: true,
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "button primary" },
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "file-filters" },
});
/** @type {__VLS_StyleScopedClasses['file-filters']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    placeholder: "Search memories…",
});
(__VLS_ctx.query);
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filter),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "",
});
for (const [t] of __VLS_vFor((['NOTE', 'DECISION', 'BUG', 'TASK', 'SOLUTION', 'QUESTION', 'OUTCOME']))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (t),
    });
    (t);
    // @ts-ignore
    [title, content, query, filter,];
}
for (const [m] of __VLS_vFor((__VLS_ctx.shown))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        key: (m.id),
        ...{ class: "memory-card" },
    });
    /** @type {__VLS_StyleScopedClasses['memory-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "record-type" },
    });
    /** @type {__VLS_StyleScopedClasses['record-type']} */ ;
    (m.type);
    (m.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (m.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (m.content);
    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
    (new Date(m.createdAt).toLocaleString());
    if (m.relativeFilePath) {
        (m.relativeFilePath);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "record-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['record-actions']} */ ;
    if (m.status === 'OPEN') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(m.status === 'OPEN'))
                        throw 0;
                    return (__VLS_ctx.store.action(__VLS_ctx.projectId, m.id, 'resolve'));
                    // @ts-ignore
                    [store, shown, projectId,];
                } },
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return (__VLS_ctx.store.action(__VLS_ctx.projectId, m.id, 'archive'));
                // @ts-ignore
                [store, projectId,];
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
