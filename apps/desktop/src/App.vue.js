import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import HomeView from './views/HomeView.vue';
import ProjectDetailView from './views/ProjectDetailView.vue';
const locationHash = ref(window.location.hash);
const projectId = computed(() => locationHash.value.match(/^#\/projects\/([0-9a-f-]+)$/i)?.[1] ?? null);
function syncLocation() {
    locationHash.value = window.location.hash;
}
function openProject(id) {
    window.location.hash = `/projects/${id}`;
}
onMounted(() => window.addEventListener('hashchange', syncLocation));
onBeforeUnmount(() => window.removeEventListener('hashchange', syncLocation));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-shell" },
});
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "app-header" },
});
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    ...{ class: "brand-link" },
    href: "#/",
});
/** @type {__VLS_StyleScopedClasses['brand-link']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brand-mark" },
});
/** @type {__VLS_StyleScopedClasses['brand-mark']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
if (__VLS_ctx.projectId) {
    const __VLS_0 = ProjectDetailView;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        projectId: (__VLS_ctx.projectId),
    }));
    const __VLS_2 = __VLS_1({
        projectId: (__VLS_ctx.projectId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    const __VLS_5 = HomeView;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onOpenProject': {} },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onOpenProject': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = {
        /** @type {typeof __VLS_10.openProject} */
        onOpenProject: (__VLS_ctx.openProject),
    };
    var __VLS_8;
    var __VLS_9;
}
// @ts-ignore
[projectId, projectId, openProject,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
