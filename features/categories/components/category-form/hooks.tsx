import { useState } from 'react';
import { CategoryDto } from '../../api/types';

export const useCreateCategorySheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => {
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        setIsOpen,
        open,
        close,
    };
};

export const useCreateSubcategorySheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [parentCategory, setParentCategory] = useState<CategoryDto | null>(null);

    const open = (parentId: CategoryDto) => {
        setParentCategory(parentId);
        setIsOpen(true);
    };
    const close = () => {
        setParentCategory(null);
        setIsOpen(true);
    };

    return {
        isOpen,
        setIsOpen,
        open,
        close,
        parentCategory,
    };
};

export const useDeleteCategorySheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<CategoryDto | null>(null);
    const open = (category: CategoryDto) => {
        setCategory(category);
        setIsOpen(true);
    };

    return {
        isOpen,
        setIsOpen,
        open,
        category,
    };
};

export const useEditSubcategorySheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setSubcategory] = useState<CategoryDto | null>(null);
    const [parentCategory, setParentCategory] = useState<CategoryDto | null>(null);

    const open = (category: CategoryDto, parentCategory: CategoryDto) => {
        setSubcategory(category);
        setParentCategory(parentCategory);
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        setIsOpen,
        open,
        close,
        category,
        parentCategory,
    };
};

export const useEditCategorySheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<CategoryDto | null>(null);
    const open = (category: CategoryDto) => {
        setCategory(category);
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        setIsOpen,
        open,
        close,
        category,
    };
};

export const useMoveCategorySheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState<CategoryDto | null>(null);

    const open = (category: CategoryDto) => {
        setCategory(category);
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        setIsOpen,
        open,
        close,
        category,
    };
};
