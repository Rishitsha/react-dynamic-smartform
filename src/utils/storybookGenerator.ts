import { FieldSchema, StepSchema } from "../types";

/**
 * generateStories
 *
 * Generates Storybook CSF (Component Story Format v3) story source code
 * from a SmartForm schema. Outputs a string you can write to `<Name>.stories.tsx`.
 *
 * @example
 * // In your build script or a CLI tool:
 * const code = generateStories(schema, "ContactForm");
 * fs.writeFileSync("ContactForm.stories.tsx", code);
 */
export function generateStories(
  schema: FieldSchema[] | StepSchema[],
  componentName = "MyForm",
  importPath = "react-dynamic-smartform"
): string {
  const isSteps = schema.length > 0 && "title" in schema[0];

  const lines: string[] = [];

  // Imports
  lines.push(`import type { Meta, StoryObj } from "@storybook/react";`);
  lines.push(`import { ${isSteps ? "SmartFormWizard" : "SmartForm"} } from "${importPath}";`);
  lines.push(`import { action } from "@storybook/addon-actions";`);
  lines.push("");

  // Schema export
  if (isSteps) {
    lines.push(`const steps = ${JSON.stringify(schema, null, 2)};`);
  } else {
    lines.push(`const schema = ${JSON.stringify(schema, null, 2)};`);
  }
  lines.push("");

  // Meta
  const comp = isSteps ? "SmartFormWizard" : "SmartForm";
  lines.push(`const meta: Meta<typeof ${comp}> = {`);
  lines.push(`  title: "SmartForm/${componentName}",`);
  lines.push(`  component: ${comp},`);
  lines.push(`  parameters: { layout: "centered" },`);
  lines.push(`  tags: ["autodocs"],`);
  lines.push(`};`);
  lines.push(`export default meta;`);
  lines.push("");
  lines.push(`type Story = StoryObj<typeof ${comp}>;`);
  lines.push("");

  // Default story
  lines.push(`export const Default: Story = {`);
  lines.push(`  args: {`);
  if (isSteps) {
    lines.push(`    steps,`);
  } else {
    lines.push(`    schema,`);
  }
  lines.push(`    onSubmit: action("onSubmit"),`);
  lines.push(`    submitLabel: "Submit",`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push("");

  // Pre-filled story (only for flat schemas)
  if (!isSteps) {
    const flatSchema = schema as FieldSchema[];
    const defaultValues: Record<string, any> = {};
    for (const field of flatSchema) {
      if (field.type === "text" || field.type === "email" || field.type === "password") {
        defaultValues[field.name] = `Sample ${field.label}`;
      } else if (field.type === "number") {
        defaultValues[field.name] = 42;
      } else if (field.type === "checkbox") {
        defaultValues[field.name] = true;
      } else if (field.type === "select" || field.type === "radio") {
        const firstOpt = field.options?.[0];
        if (firstOpt) {
          defaultValues[field.name] =
            typeof firstOpt === "string" ? firstOpt : firstOpt.value;
        }
      } else if (field.type === "rating") {
        defaultValues[field.name] = 3;
      }
    }
    lines.push(`export const Prefilled: Story = {`);
    lines.push(`  args: {`);
    lines.push(`    schema,`);
    lines.push(`    onSubmit: action("onSubmit"),`);
    lines.push(`    defaultValues: ${JSON.stringify(defaultValues, null, 4)},`);
    lines.push(`  },`);
    lines.push(`};`);
    lines.push("");
  }

  // Disabled story
  lines.push(`export const Disabled: Story = {`);
  lines.push(`  args: {`);
  if (isSteps) {
    lines.push(`    steps: steps.map(s => ({ ...s, fields: s.fields.map(f => ({ ...f, disabled: true })) })),`);
  } else {
    lines.push(`    schema: (schema as any).map((f: any) => ({ ...f, disabled: true })),`);
  }
  lines.push(`    onSubmit: action("onSubmit"),`);
  lines.push(`  },`);
  lines.push(`};`);
  lines.push("");

  return lines.join("\n");
}

/**
 * generateStoriesFile
 *
 * Convenience wrapper — returns the stories content ready to write to disk.
 */
export function generateStoriesFile(
  schema: FieldSchema[] | StepSchema[],
  componentName: string,
  importPath = "react-dynamic-smartform"
): { filename: string; content: string } {
  return {
    filename: `${componentName}.stories.tsx`,
    content: generateStories(schema, componentName, importPath),
  };
}