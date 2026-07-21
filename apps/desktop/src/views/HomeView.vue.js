import { onMounted, ref } from 'vue';
import AddProjectDialog from '../components/AddProjectDialog.vue';
import ProjectCard from '../components/ProjectCard.vue';
import { useProjectsStore } from '../stores/projects';
const store = useProjectsStore();
const emit = defineEmits();
const detectedProject = ref(null);
const actionError = ref(null);
const success = ref(null);
const selecting = ref(false);
const saving = ref(false);
const deletingId = ref(null);
function errorMessage(error) {
    return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
async function addProject() {
    selecting.value = true;
    actionError.value = null;
    success.value = null;
    try {
        const selection = await window.desktop.selectProjectDirectory();
        if (!selection.canceled && selection.path)
            detectedProject.value = await window.desktop.detectProject(selection.path);
    }
    catch (error) {
        actionError.value = errorMessage(error);
    }
    finally {
        selecting.value = false;
    }
}
async function saveProject(project) {
    saving.value = true;
    actionError.value = null;
    try {
        await store.create(project);
        detectedProject.value = null;
        success.value = `${project.name} was added successfully.`;
    }
    catch (error) {
        actionError.value = errorMessage(error);
    }
    finally {
        saving.value = false;
    }
}
async function deleteProject(id) {
    deletingId.value = id;
    actionError.value = null;
    try {
        await store.remove(id);
        success.value = 'Project deleted.';
    }
    catch (error) {
        actionError.value = errorMessage(error);
    }
    finally {
        deletingId.value = null;
    }
}
onMounted(() => store.load());
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
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "home-actions" },
});
/** @type {__VLS_StyleScopedClasses['home-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.addProject) },
    ...{ class: "button primary" },
    disabled: (__VLS_ctx.selecting),
});
/** @type {__VLS_StyleScopedClasses['button']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.selecting ? 'Selecting…' : 'Add Project');
if (__VLS_ctx.actionError || __VLS_ctx.store.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert error-alert" },
    });
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['error-alert']} */ ;
    (__VLS_ctx.actionError ?? __VLS_ctx.store.error);
    if (__VLS_ctx.store.error) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.store.load) },
        });
    }
}
if (__VLS_ctx.success) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert success-alert" },
    });
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['success-alert']} */ ;
    (__VLS_ctx.success);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "section-heading" },
});
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
if (__VLS_ctx.store.hasProjects) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "project-count" },
    });
    /** @type {__VLS_StyleScopedClasses['project-count']} */ ;
    (__VLS_ctx.store.projects.length);
    (__VLS_ctx.store.projects.length === 1 ? 'project' : 'projects');
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
else if (!__VLS_ctx.store.hasProjects) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.addProject) },
        ...{ class: "button primary" },
        disabled: (__VLS_ctx.selecting),
    });
    /** @type {__VLS_StyleScopedClasses['button']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "project-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['project-grid']} */ ;
    for (const [project] of __VLS_vFor((__VLS_ctx.store.projects))) {
        const __VLS_0 = ProjectCard;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            ...{ 'onDelete': {} },
            ...{ 'onOpen': {} },
            key: (project.id),
            project: (project),
            deleting: (__VLS_ctx.deletingId === project.id),
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onDelete': {} },
            ...{ 'onOpen': {} },
            key: (project.id),
            project: (project),
            deleting: (__VLS_ctx.deletingId === project.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_5;
        const __VLS_6 = {
            /** @type {typeof __VLS_5.delete} */
            onDelete: (__VLS_ctx.deleteProject),
        };
        const __VLS_7 = {
            /** @type {typeof __VLS_5.open} */
            onOpen: (...[$event]) => {
                if (!!(__VLS_ctx.store.loading))
                    throw 0;
                if (!!(!__VLS_ctx.store.hasProjects))
                    throw 0;
                return (__VLS_ctx.emit('openProject', $event));
                // @ts-ignore
                [addProject, addProject, selecting, selecting, selecting, actionError, actionError, store, store, store, store, store, store, store, store, store, store, success, success, deletingId, deleteProject, emit,];
            },
        };
        var __VLS_3;
        var __VLS_4;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.detectedProject) {
    const __VLS_8 = AddProjectDialog;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ 'onClose': {} },
        ...{ 'onSave': {} },
        project: (__VLS_ctx.detectedProject),
        saving: (__VLS_ctx.saving),
        error: (__VLS_ctx.actionError),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClose': {} },
        ...{ 'onSave': {} },
        project: (__VLS_ctx.detectedProject),
        saving: (__VLS_ctx.saving),
        error: (__VLS_ctx.actionError),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    const __VLS_14 = {
        /** @type {typeof __VLS_13.close} */
        onClose: (...[$event]) => {
            if (!(__VLS_ctx.detectedProject))
                throw 0;
            return (__VLS_ctx.detectedProject = null);
            // @ts-ignore
            [actionError, detectedProject, detectedProject, detectedProject, saving,];
        },
    };
    const __VLS_15 = {
        /** @type {typeof __VLS_13.save} */
        onSave: (__VLS_ctx.saveProject),
    };
    var __VLS_11;
    var __VLS_12;
}
// @ts-ignore
[saveProject,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
