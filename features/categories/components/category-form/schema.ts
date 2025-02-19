import { z } from 'zod';

export const CategoryFormSchema = z.object({
    name: z.string().min(1),
    icon: z.string(),
    icon_color: z.string(),
    type: z.string(),
});

export const MoveCategoryFormSchema = z.object({
    parent_id: z.string(),
});
