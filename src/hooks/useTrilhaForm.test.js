import { renderHook, act } from '@testing-library/react-native';
import { useTrilhaForm } from '../hooks/useTrilhaForm';

describe('useTrilhaForm', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useTrilhaForm());

        expect(result.current.nome).toBe('');
        expect(result.current.descricao).toBe('');
        expect(result.current.vagas).toBe('');
        expect(result.current.senha).toBe('');
        expect(result.current.image).toBe(null);
        expect(result.current.activities).toEqual([]);
    });

    it('should validate form correctly', () => {
        const { result } = renderHook(() => useTrilhaForm());

        act(() => {
            result.current.setNome('Test Trail');
            result.current.setVagas('10');
            result.current.setDescricao('Test Description');
        });

        expect(result.current.validateForm()).toBe(true);
    });

    it('should reset form', () => {
        const { result } = renderHook(() => useTrilhaForm());

        act(() => {
            result.current.setNome('Test');
            result.current.setImage('test.jpg');
            result.current.resetForm();
        });

        expect(result.current.nome).toBe('');
        expect(result.current.image).toBe(null);
    });

    it('should load form data with undefined values', () => {
        const { result } = renderHook(() => useTrilhaForm());
        const trail = {
            trailName: undefined,
            trailDescription: undefined,
            trailVacancy: undefined,
            trailPassword: undefined,
            trailImage: undefined,
            activities: undefined
        };

        act(() => {
            result.current.loadFormData(trail);
        });

        expect(result.current.nome).toBe('');
        expect(result.current.descricao).toBe('');
        expect(result.current.vagas).toBe('');
        expect(result.current.senha).toBe('');
        expect(result.current.image).toBe(null);
        expect(result.current.activities).toEqual([]);
    });
});