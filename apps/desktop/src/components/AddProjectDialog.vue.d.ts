import type { DetectedProject } from '@developer-memory/shared-types';
type __VLS_Props = {
    project: DetectedProject;
    saving: boolean;
    error: string | null;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    close: () => any;
    save: (project: Required<import("@developer-memory/shared-types").CreateProjectInput>) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: (() => any) | undefined;
    onSave?: ((project: Required<import("@developer-memory/shared-types").CreateProjectInput>) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
