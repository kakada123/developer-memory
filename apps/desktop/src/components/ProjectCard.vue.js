const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.$emit('open', __VLS_ctx.project.id));
            // @ts-ignore
            [$emit, project,];
        } },
    ...{ onKeyup: (...[$event]) => {
            return (__VLS_ctx.$emit('open', __VLS_ctx.project.id));
            // @ts-ignore
            [$emit, project,];
        } },
    ...{ class: "project-card" },
    role: "button",
    tabindex: "0",
});
/** @type {__VLS_StyleScopedClasses['project-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "project-card-heading" },
});
/** @type {__VLS_StyleScopedClasses['project-card-heading']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "project-icon" },
});
/** @type {__VLS_StyleScopedClasses['project-icon']} */ ;
(__VLS_ctx.project.name.slice(0, 1).toUpperCase());
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "project-title" },
});
/** @type {__VLS_StyleScopedClasses['project-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.project.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    title: (__VLS_ctx.project.path),
});
(__VLS_ctx.project.path);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.$emit('delete', __VLS_ctx.project.id));
            // @ts-ignore
            [$emit, project, project, project, project, project,];
        } },
    ...{ class: "delete-button" },
    disabled: (__VLS_ctx.deleting),
});
/** @type {__VLS_StyleScopedClasses['delete-button']} */ ;
(__VLS_ctx.deleting ? 'Deleting…' : 'Delete');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tags" },
});
/** @type {__VLS_StyleScopedClasses['tags']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.project.framework ?? 'Unknown');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.project.language ?? 'Unknown');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: ({ active: __VLS_ctx.project.hasGit }) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
(__VLS_ctx.project.hasGit ? 'Git repository' : 'No Git');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: ({ active: __VLS_ctx.project.indexStatus === 'INDEXED' }) },
});
/** @type {__VLS_StyleScopedClasses['active']} */ ;
(__VLS_ctx.project.indexStatus.replaceAll('_', ' '));
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "created" },
});
/** @type {__VLS_StyleScopedClasses['created']} */ ;
(__VLS_ctx.formatDate(__VLS_ctx.project.createdAt));
// @ts-ignore
[project, project, project, project, project, project, project, deleting, deleting, formatDate,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
