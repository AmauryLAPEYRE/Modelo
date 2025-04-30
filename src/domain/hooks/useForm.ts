import { useState, useCallback } from 'react';

type ValidationError = string | null;
type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], formValues: T) => ValidationError;
};

/**
 * Hook personnalisé pour gérer les formulaires
 * @param initialValues Valeurs initiales du formulaire
 * @param validationRules Règles de validation pour chaque champ
 * @param onSubmit Fonction à exécuter lors de la soumission
 * @returns Fonctions et valeurs pour gérer le formulaire
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void | Promise<void>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Valider un champ
  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      if (!validationRules || !validationRules[name]) {
        return null;
      }
      
      return validationRules[name]!(value, values);
    },
    [validationRules, values]
  );

  // Valider tous les champs
  const validateForm = useCallback(() => {
    if (!validationRules) {
      return true;
    }

    const newErrors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
    let isFormValid = true;

    Object.keys(values).forEach((key) => {
      const fieldKey = key as keyof T;
      if (validationRules[fieldKey]) {
        const error = validateField(fieldKey, values[fieldKey]);
        newErrors[fieldKey] = error;
        if (error) {
          isFormValid = false;
        }
      }
    });

    setErrors(newErrors);
    setIsValid(isFormValid);
    return isFormValid;
  }, [validateField, validationRules, values]);

  // Gérer les changements de valeur
  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      
      // Vérifier si le champ a déjà été touché
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        
        // Mettre à jour la validité globale
        setIsValid(Object.values({ ...errors, [name]: error }).every((e) => e === null));
      }
    },
    [errors, touched, validateField]
  );

  // Marquer un champ comme "touché"
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      
      const error = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
      
      // Mettre à jour la validité globale
      setIsValid(Object.values({ ...errors, [name]: error }).every((e) => e === null));
    },
    [errors, validateField, values]
  );

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Marquer tous les champs comme touchés
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      const isFormValid = validateForm();
      
      if (isFormValid && onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [onSubmit, validateForm, values]
  );

  // Réinitialiser le formulaire
  const resetForm = useCallback((newValues: T = initialValues) => {
    setValues(newValues);
    setErrors({} as Record<keyof T, string | null>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);

  // Définir une valeur spécifique
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValue,
    validateForm
  };
};