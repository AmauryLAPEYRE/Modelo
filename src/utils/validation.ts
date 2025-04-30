import * as Yup from 'yup';
import { isValidEmail, isStrongPassword } from './helpers';

// Schéma de validation pour l'inscription d'un modèle
export const modelRegistrationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Le nom complet est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  email: Yup.string()
    .required('L\'email est requis')
    .email('Email invalide')
    .test('is-valid-email', 'Email invalide', (value) => isValidEmail(value || '')),
  
  password: Yup.string()
    .required('Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .test(
      'is-strong-password',
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
      (value) => isStrongPassword(value || '')
    ),
  
  confirmPassword: Yup.string()
    .required('La confirmation du mot de passe est requise')
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas'),
  
  age: Yup.number()
    .required('L\'âge est requis')
    .min(18, 'Vous devez avoir au moins 18 ans')
    .max(100, 'Age invalide'),
  
  gender: Yup.string()
    .required('Le genre est requis'),
  
  city: Yup.string()
    .required('La ville est requise')
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(50, 'La ville ne peut pas dépasser 50 caractères'),
  
  interests: Yup.array()
    .of(Yup.string())
    .min(1, 'Sélectionnez au moins un centre d\'intérêt')
    .required('Les centres d\'intérêt sont requis'),
  
  termsAccepted: Yup.boolean()
    .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
});

// Schéma de validation pour l'inscription d'un professionnel
export const professionalRegistrationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Le nom complet est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  businessName: Yup.string()
    .min(2, 'Le nom commercial doit contenir au moins 2 caractères')
    .max(50, 'Le nom commercial ne peut pas dépasser 50 caractères'),
  
  email: Yup.string()
    .required('L\'email est requis')
    .email('Email invalide')
    .test('is-valid-email', 'Email invalide', (value) => isValidEmail(value || '')),
  
  password: Yup.string()
    .required('Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .test(
      'is-strong-password',
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
      (value) => isStrongPassword(value || '')
    ),
  
  confirmPassword: Yup.string()
    .required('La confirmation du mot de passe est requise')
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas'),
  
  status: Yup.string()
    .required('Le statut professionnel est requis'),
  
  services: Yup.array()
    .of(Yup.string())
    .min(1, 'Sélectionnez au moins un service proposé')
    .required('Les services proposés sont requis'),
  
  city: Yup.string()
    .required('La ville est requise')
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(50, 'La ville ne peut pas dépasser 50 caractères'),
  
  termsAccepted: Yup.boolean()
    .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
});

// Schéma de validation pour la connexion
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('L\'email est requis')
    .email('Email invalide'),
  
  password: Yup.string()
    .required('Le mot de passe est requis')
});

// Schéma de validation pour la création d'une prestation
export const serviceCreationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Le titre est requis')
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  
  description: Yup.string()
    .required('La description est requise')
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  
  type: Yup.mixed()
    .required('Le type de prestation est requis'),
  
  date: Yup.object().shape({
    startDate: Yup.date()
      .required('La date de début est requise')
      .min(new Date(), 'La date de début doit être ultérieure à aujourd\'hui'),
    
    endDate: Yup.date()
      .min(
        Yup.ref('startDate'),
        'La date de fin doit être ultérieure à la date de début'
      ),
    
    duration: Yup.number()
      .positive('La durée doit être positive')
  }),
  
  location: Yup.object().shape({
    city: Yup.string()
      .required('La ville est requise'),
    
    address: Yup.string()
      .when('isRemote', {
        is: false,
        then: Yup.string().required('L\'adresse est requise')
      })
  }),
  
  payment: Yup.object().shape({
    type: Yup.string()
      .required('Le type de paiement est requis'),
    
    amount: Yup.number()
      .when('type', {
        is: 'paid',
        then: Yup.number()
          .required('Le montant est requis')
          .positive('Le montant doit être positif')
      })
  }),
  
  criteria: Yup.object().shape({
    gender: Yup.string(),
    
    ageMin: Yup.number()
      .min(18, 'L\'âge minimum doit être d\'au moins 18 ans'),
    
    ageMax: Yup.number()
      .min(
        Yup.ref('ageMin'),
        'L\'âge maximum doit être supérieur à l\'âge minimum'
      )
  }),
  
  images: Yup.array()
    .max(5, 'Vous ne pouvez pas ajouter plus de 5 images')
});

// Schéma de validation pour la création d'une candidature
export const applicationCreationSchema = Yup.object().shape({
  message: Yup.string()
    .required('Le message est requis')
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  
  photos: Yup.array()
    .min(1, 'Vous devez ajouter au moins une photo')
    .max(3, 'Vous ne pouvez pas ajouter plus de 3 photos')
});

// Schéma de validation pour la modification du profil d'un modèle
export const modelProfileUpdateSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Le nom complet est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  age: Yup.number()
    .required('L\'âge est requis')
    .min(18, 'Vous devez avoir au moins 18 ans')
    .max(100, 'Age invalide'),
  
  gender: Yup.string()
    .required('Le genre est requis'),
  
  bio: Yup.string()
    .max(500, 'La biographie ne peut pas dépasser 500 caractères'),
  
  height: Yup.number()
    .min(100, 'La taille doit être d\'au moins 100 cm')
    .max(250, 'La taille ne peut pas dépasser 250 cm'),
  
  hairColor: Yup.string(),
  
  eyeColor: Yup.string(),
  
  phoneNumber: Yup.string()
    .matches(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  
  socialMedia: Yup.object().shape({
    instagram: Yup.string()
      .matches(/^(@)?[a-zA-Z0-9._]+$/, 'Nom d\'utilisateur Instagram invalide'),
    
    facebook: Yup.string(),
    
    tiktok: Yup.string()
      .matches(/^(@)?[a-zA-Z0-9._]+$/, 'Nom d\'utilisateur TikTok invalide'),
    
    portfolio: Yup.string()
      .matches(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'URL invalide')
  })
});

// Schéma de validation pour la modification du profil d'un professionnel
export const professionalProfileUpdateSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Le nom complet est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  businessName: Yup.string()
    .min(2, 'Le nom commercial doit contenir au moins 2 caractères')
    .max(50, 'Le nom commercial ne peut pas dépasser 50 caractères'),
  
  status: Yup.string()
    .required('Le statut professionnel est requis'),
  
  services: Yup.array()
    .of(Yup.string())
    .min(1, 'Sélectionnez au moins un service proposé')
    .required('Les services proposés sont requis'),
  
  bio: Yup.string()
    .max(500, 'La biographie ne peut pas dépasser 500 caractères'),
  
  phoneNumber: Yup.string()
    .matches(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  
  socialMedia: Yup.object().shape({
    instagram: Yup.string()
      .matches(/^(@)?[a-zA-Z0-9._]+$/, 'Nom d\'utilisateur Instagram invalide'),
    
    facebook: Yup.string(),
    
    portfolio: Yup.string()
      .matches(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'URL invalide')
  })
});

// Schéma de validation pour l'évaluation
export const ratingSchema = Yup.object().shape({
  score: Yup.number()
    .required('La note est requise')
    .min(1, 'La note minimale est 1')
    .max(5, 'La note maximale est 5'),
  
  comment: Yup.string()
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères'),
  
  isPublic: Yup.boolean()
});