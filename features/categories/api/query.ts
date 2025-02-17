import { supabase } from '@/utils/supabase';
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoriesWithChildren, CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './types';
import { formatToCategoryTree, formatTreeToSelectOptions } from './utils';
import { SelectOption } from '@/components/select-field';

export const categoriesKeys = {
    all: ['categories'] as const,
    lists: () => [...categoriesKeys.all, 'list'] as const,
    list: () => [...categoriesKeys.lists()] as const, // TODO: leaveing that follow the same pattern
    create: () => [...categoriesKeys.all, 'create'] as const,
    update: () => [...categoriesKeys.all, 'update'] as const,
};

const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('parent_id', { nullsFirst: true })
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data as CategoryDto[];
};

const createCategory = async (data: CreateCategoryDto) => {
    const { data: response, error } = await supabase.from('categories').insert(data).select('id');

    if (error) {
        throw error;
    }

    return {
        id: response?.[0].id,
    };
};

const updateCategory = async ({ id, ...data }: UpdateCategoryDto) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id);

    if (error) {
        throw error;
    }
};

const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
        throw error;
    }
};

export const useGetCategories = () => {
    return useQuery<
        CategoryDto[],
        Error,
        {
            tree: CategoriesWithChildren;
            list: CategoryDto[];
            selectOptions: SelectOption[];
        }
    >({
        queryKey: categoriesKeys.list(),
        queryFn: getCategories,
        select: (data) => {
            const tree = formatToCategoryTree(data);
            const selectOptions = formatTreeToSelectOptions(tree);
            return {
                tree,
                list: data,
                selectOptions,
            };
        },
    });
};

export const useCreateCategory = (
    options?: UseMutationOptions<unknown, Error, CreateCategoryDto>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: categoriesKeys.create(),
        mutationFn: createCategory,
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: categoriesKeys.list(),
            });
        },
        onError: (error) => {
            console.error('--> create category error', error);
        },
        ...options,
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, string>({
        mutationFn: deleteCategory,
        onError: (error) => {
            console.error('--> delete category error', error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: categoriesKeys.list(),
            });
        },
    });
};
