import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Container } from '../../src/components/layout/Container';
import { Input } from '../../src/components/core/Input';
import { Button } from '../../src/components/core/Button';
import { useAuthViewModel } from '../../src/viewModels/useAuthViewModel';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/utils/constants';
import {
  modelRegistrationSchema,
  professionalRegistrationSchema
} from '../../src/utils/validation';
import { UserRole } from '../../src/domain/entities/UserModel';

/**
 * Écran d'inscription
 */
export default function RegisterScreen() {
  // États
  const [userType, setUserType] = useState<'model' | 'professional'>('model');
  const [currentStep, setCurrentStep] = useState(1);
  
  // ViewModel
  const { registerModel, registerProfessional, registrationLoading } = useAuthViewModel();
  
  // Données initiales pour les modèles
  const initialModelValues = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    city: '',
    interests: [],
    termsAccepted: false
  };
  
  // Données initiales pour les professionnels
  const initialProfessionalValues = {
    fullName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: '',
    services: [],
    city: '',
    termsAccepted: false
  };
  
  // Gérer l'inscription
  const handleRegister = async (values: any) => {
    if (userType === 'model') {
      // Transformer les données pour le modèle
      const modelData = {
        fullName: values.fullName,
        age: parseInt(values.age),
        gender: values.gender,
        role: UserRole.MODEL,
        location: {
          city: values.city,
          radius: 30 // Rayon par défaut
        },
        interests: values.interests,
        photos: [],
        isVerified: false
      };
      
      await registerModel(modelData, values.email, values.password);
    } else {
      // Transformer les données pour le professionnel
      const professionalData = {
        fullName: values.fullName,
        businessName: values.businessName,
        role: UserRole.PROFESSIONAL,
        status: values.status,
        location: {
          city: values.city,
          radius: 30 // Rayon par défaut
        },
        services: values.services,
        isVerified: false
      };
      
      await registerProfessional(professionalData, values.email, values.password);
    }
  };
  
  // Navigation vers l'écran de connexion
  const navigateToLogin = () => {
    router.push('/login');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <Container
        background="white"
        padding="none"
        safeArea
        scrollable
        testID="register-screen"
      >
        <StatusBar style="dark" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo et titre */}
          <View style={styles.header} testID="register-header">
            <Image
              source={require('../../src/assets/images/modelo-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              testID="app-logo"
            />
            <Text style={styles.title}>Modelo</Text>
            <Text style={styles.subtitle}>Créez votre compte</Text>
          </View>
          
          {/* Sélection du type d'utilisateur */}
          <View style={styles.userTypeContainer} testID="user-type-selection">
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'model' && styles.activeUserTypeButton
              ]}
              onPress={() => setUserType('model')}
              testID="model-button"
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={userType === 'model' ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'model' && styles.activeUserTypeText
                ]}
              >
                Modèle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'professional' && styles.activeUserTypeButton
              ]}
              onPress={() => setUserType('professional')}
              testID="professional-button"
            >
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={userType === 'professional' ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'professional' && styles.activeUserTypeText
                ]}
              >
                Professionnel
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Formulaire d'inscription */}
          {userType === 'model' ? (
            <Formik
              initialValues={initialModelValues}
              validationSchema={modelRegistrationSchema}
              onSubmit={handleRegister}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue
              }) => (
                <View testID="model-form">
                  {/* Étape 1: Informations de base */}
                  {currentStep === 1 && (
                    <>
                      <Input
                        label="Nom complet"
                        placeholder="Votre nom et prénom"
                        value={values.fullName}
                        onChangeText={handleChange('fullName')}
                        onBlur={handleBlur('fullName')}
                        error={touched.fullName && errors.fullName ? errors.fullName : undefined}
                        leftIcon="person-outline"
                        required
                        testID="fullname-input"
                      />
                      
                      <Input
                        label="Email"
                        placeholder="Votre adresse email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email && errors.email ? errors.email : undefined}
                        leftIcon="mail-outline"
                        required
                        testID="email-input"
                      />
                      
                      <Input
                        label="Mot de passe"
                        placeholder="Créez votre mot de passe"
                        secureTextEntry
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password && errors.password ? errors.password : undefined}
                        leftIcon="lock-closed-outline"
                        required
                        testID="password-input"
                      />
                      
                      <Input
                        label="Confirmation du mot de passe"
                        placeholder="Confirmez votre mot de passe"
                        secureTextEntry
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                        leftIcon="lock-closed-outline"
                        required
                        testID="confirm-password-input"
                      />
                      
                      <Button
                        label="Continuer"
                        variant="primary"
                        onPress={() => setCurrentStep(2)}
                        fullWidth
                        style={styles.continueButton}
                        testID="continue-button"
                      />
                    </>
                  )}
                  
                  {/* Étape 2: Informations complémentaires */}
                  {currentStep === 2 && (
                    <>
                      <Input
                        label="Âge"
                        placeholder="Votre âge"
                        keyboardType="numeric"
                        value={values.age}
                        onChangeText={handleChange('age')}
                        onBlur={handleBlur('age')}
                        error={touched.age && errors.age ? errors.age : undefined}
                        leftIcon="calendar-outline"
                        required
                        testID="age-input"
                      />
                      
                      {/* Sélection du genre - à remplacer par un vrai sélecteur */}
                      <Input
                        label="Genre"
                        placeholder="Votre genre"
                        value={values.gender}
                        onChangeText={handleChange('gender')}
                        onBlur={handleBlur('gender')}
                        error={touched.gender && errors.gender ? errors.gender : undefined}
                        leftIcon="body-outline"
                        required
                        testID="gender-input"
                      />
                      
                      <Input
                        label="Ville"
                        placeholder="Votre ville"
                        value={values.city}
                        onChangeText={handleChange('city')}
                        onBlur={handleBlur('city')}
                        error={touched.city && errors.city ? errors.city : undefined}
                        leftIcon="location-outline"
                        required
                        testID="city-input"
                      />
                      
                      {/* Termes et conditions */}
                      <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => setFieldValue('termsAccepted', !values.termsAccepted)}
                        testID="terms-checkbox"
                      >
                        <Ionicons
                          name={values.termsAccepted ? 'checkbox-outline' : 'square-outline'}
                          size={24}
                          color={values.termsAccepted ? COLORS.primary : COLORS.gray}
                        />
                        <Text style={styles.termsText}>
                          J'accepte les{' '}
                          <Text style={styles.termsLink}>conditions d'utilisation</Text>
                        </Text>
                      </TouchableOpacity>
                      {touched.termsAccepted && errors.termsAccepted && (
                        <Text style={styles.errorText}>{errors.termsAccepted}</Text>
                      )}
                      
                      <View style={styles.buttonRow}>
                        <Button
                          label="Retour"
                          variant="outline"
                          onPress={() => setCurrentStep(1)}
                          style={[styles.backButton, styles.navigationButton]}
                          testID="back-button"
                        />
                        
                        <Button
                          label="S'inscrire"
                          variant="primary"
                          onPress={handleSubmit}
                          loading={registrationLoading}
                          disabled={registrationLoading || !values.termsAccepted}
                          style={styles.navigationButton}
                          testID="register-button"
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={initialProfessionalValues}
              validationSchema={professionalRegistrationSchema}
              onSubmit={handleRegister}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue
              }) => (
                <View testID="professional-form">
                  {/* Étape 1: Informations de base */}
                  {currentStep === 1 && (
                    <>
                      <Input
                        label="Nom complet"
                        placeholder="Votre nom et prénom"
                        value={values.fullName}
                        onChangeText={handleChange('fullName')}
                        onBlur={handleBlur('fullName')}
                        error={touched.fullName && errors.fullName ? errors.fullName : undefined}
                        leftIcon="person-outline"
                        required
                        testID="fullname-input"
                      />
                      
                      <Input
                        label="Nom commercial"
                        placeholder="Nom de votre entreprise/activité"
                        value={values.businessName}
                        onChangeText={handleChange('businessName')}
                        onBlur={handleBlur('businessName')}
                        error={touched.businessName && errors.businessName ? errors.businessName : undefined}
                        leftIcon="business-outline"
                        testID="business-name-input"
                      />
                      
                      <Input
                        label="Email"
                        placeholder="Votre adresse email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email && errors.email ? errors.email : undefined}
                        leftIcon="mail-outline"
                        required
                        testID="email-input"
                      />
                      
                      <Input
                        label="Mot de passe"
                        placeholder="Créez votre mot de passe"
                        secureTextEntry
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password && errors.password ? errors.password : undefined}
                        leftIcon="lock-closed-outline"
                        required
                        testID="password-input"
                      />
                      
                      <Input
                        label="Confirmation du mot de passe"
                        placeholder="Confirmez votre mot de passe"
                        secureTextEntry
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                        leftIcon="lock-closed-outline"
                        required
                        testID="confirm-password-input"
                      />
                      
                      <Button
                        label="Continuer"
                        variant="primary"
                        onPress={() => setCurrentStep(2)}
                        fullWidth
                        style={styles.continueButton}
                        testID="continue-button"
                      />
                    </>
                  )}
                  
                  {/* Étape 2: Informations professionnelles */}
                  {currentStep === 2 && (
                    <>
                      {/* Statut professionnel - à remplacer par un vrai sélecteur */}
                      <Input
                        label="Statut"
                        placeholder="Votre statut professionnel"
                        value={values.status}
                        onChangeText={handleChange('status')}
                        onBlur={handleBlur('status')}
                        error={touched.status && errors.status ? errors.status : undefined}
                        leftIcon="briefcase-outline"
                        required
                        testID="status-input"
                      />
                      
                      <Input
                        label="Ville"
                        placeholder="Votre ville"
                        value={values.city}
                        onChangeText={handleChange('city')}
                        onBlur={handleBlur('city')}
                        error={touched.city && errors.city ? errors.city : undefined}
                        leftIcon="location-outline"
                        required
                        testID="city-input"
                      />
                      
                      {/* Termes et conditions */}
                      <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => setFieldValue('termsAccepted', !values.termsAccepted)}
                        testID="terms-checkbox"
                      >
                        <Ionicons
                          name={values.termsAccepted ? 'checkbox-outline' : 'square-outline'}
                          size={24}
                          color={values.termsAccepted ? COLORS.primary : COLORS.gray}
                        />
                        <Text style={styles.termsText}>
                          J'accepte les{' '}
                          <Text style={styles.termsLink}>conditions d'utilisation</Text>
                        </Text>
                      </TouchableOpacity>
                      {touched.termsAccepted && errors.termsAccepted && (
                        <Text style={styles.errorText}>{errors.termsAccepted}</Text>
                      )}
                      
                      <View style={styles.buttonRow}>
                        <Button
                          label="Retour"
                          variant="outline"
                          onPress={() => setCurrentStep(1)}
                          style={[styles.backButton, styles.navigationButton]}
                          testID="back-button"
                        />
                        
                        <Button
                          label="S'inscrire"
                          variant="primary"
                          onPress={handleSubmit}
                          loading={registrationLoading}
                          disabled={registrationLoading || !values.termsAccepted}
                          style={styles.navigationButton}
                          testID="register-button"
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
            </Formik>
          )}
          
          {/* Lien de connexion */}
          <View style={styles.loginContainer} testID="login-link-container">
            <Text style={styles.loginText}>
              Vous avez déjà un compte ?
            </Text>
            <TouchableOpacity
              onPress={navigateToLogin}
              testID="login-link"
            >
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
    textAlign: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.regular,
    paddingVertical: SPACING.medium,
    marginHorizontal: SPACING.xs,
  },
  activeUserTypeButton: {
    backgroundColor: COLORS.primary,
  },
  userTypeText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: SPACING.small,
  },
  activeUserTypeText: {
    color: COLORS.white,
  },
  continueButton: {
    marginTop: SPACING.medium,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  termsText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginLeft: SPACING.small,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.error,
    marginTop: -SPACING.small,
    marginBottom: SPACING.small,
    marginLeft: SPACING.small,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.medium,
  },
  navigationButton: {
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.small,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.medium,
    marginRight: SPACING.small,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
  },
});