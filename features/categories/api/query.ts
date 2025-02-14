import { supabase } from '@/utils/supabase';
import { useQuery } from '@tanstack/react-query';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './types';
import { formatToCategoryTree } from './utils';

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
        .order('parent_id', { nullsFirst: true });

    if (error) {
        throw error;
    }

    return data as CategoryDto[];
};

const createCategory = async (data: CreateCategoryDto) => {
    const { error } = await supabase.from('categories').insert(data);

    if (error) {
        throw error;
    }
};

const updateCategory = async ({ id, ...data }: UpdateCategoryDto) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id);

    if (error) {
        throw error;
    }
};

type Tree = Record<string, CategoryDto & { children?: CategoryDto[] }>;

export const useGetCategories = () => {
    return useQuery<
        CategoryDto[],
        Error,
        {
            tree: Tree;
            list: CategoryDto[];
        }
    >({
        queryKey: categoriesKeys.list(),
        queryFn: getCategories,
        select: (data) => {
            return {
                tree: formatToCategoryTree(data),
                list: data,
            };
        },
    });
};
