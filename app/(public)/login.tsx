import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Container } from '../../src/components/layout/Container';
import { Input } from '../../src/components/core/Input';
import { Button } from '../../src/components/core/Button';
import { useAuthViewModel } from '../../src/viewModels/useAuthViewModel';
import { COLORS, SPACING, FONT_SIZES } from '../../src/utils/constants';

// Schéma de validation
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  
  password: Yup.string()
    .required('Le mot de passe est requis')
});

/**
 * Écran de connexion
 */
export default function LoginScreen() {
  // States
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // ViewModel
  const {
    loginLoading,
    resetPasswordLoading,
    login,
    forgotPassword
  } = useAuthViewModel();
  
  // Gérer la connexion
  const handleLogin = async (values: { email: string; password: string }) => {
    await login(values.email, values.password);
  };
  
  // Gérer la demande de réinitialisation de mot de passe
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email');
      return;
    }
    
    const success = await forgotPassword(forgotPasswordEmail);
    
    if (success) {
      setShowForgotPassword(false);
      Alert.alert(
        'Email envoyé',
        'Un email de réinitialisation de mot de passe a été envoyé à votre adresse email.',
        [{ text: 'OK' }]
      );
    }
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
        testID="login-screen"
      >
        <StatusBar style="dark" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo et titre */}
          <View style={styles.header} testID="login-header">
            <Image
              source={require('../../src/assets/images/modelo-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              testID="app-logo"
            />
            <Text style={styles.title}>Modelo</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>
          
          {/* Formulaire de connexion */}
          <View style={styles.formContainer}>
            {showForgotPassword ? (
              <View style={styles.forgotPasswordContainer} testID="forgot-password-form">
                <Text style={styles.forgotPasswordTitle}>
                  Réinitialisation du mot de passe
                </Text>
                <Text style={styles.forgotPasswordText}>
                  Entrez votre adresse email pour recevoir un lien de réinitialisation.
                </Text>
                
                <Input
                  label="Email"
                  placeholder="Votre adresse email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={forgotPasswordEmail}
                  onChangeText={setForgotPasswordEmail}
                  leftIcon="mail-outline"
                  style={styles.input}
                  testID="forgot-password-email"
                />
                
                <View style={styles.forgotPasswordButtons}>
                  <Button
                    label="Annuler"
                    variant="outline"
                    onPress={() => setShowForgotPassword(false)}
                    style={styles.forgotPasswordButton}
                    testID="cancel-forgot-password"
                  />
                  
                  <Button
                    label="Envoyer"
                    variant="primary"
                    onPress={handleForgotPassword}
                    loading={resetPasswordLoading}
                    disabled={resetPasswordLoading || !forgotPasswordEmail}
                    style={styles.forgotPasswordButton}
                    testID="submit-forgot-password"
                  />
                </View>
              </View>
            ) : (
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched
                }) => (
                  <View testID="login-form">
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
                      style={styles.input}
                      testID="email-input"
                    />
                    
                    <Input
                      label="Mot de passe"
                      placeholder="Votre mot de passe"
                      secureTextEntry
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password && errors.password ? errors.password : undefined}
                      leftIcon="lock-closed-outline"
                      style={styles.input}
                      testID="password-input"
                    />
                    
                    <TouchableOpacity
                      onPress={() => setShowForgotPassword(true)}
                      style={styles.forgotPasswordLink}
                      testID="forgot-password-link"
                    >
                      <Text style={styles.forgotPasswordLinkText}>
                        Mot de passe oublié ?
                      </Text>
                    </TouchableOpacity>
                    
                    <Button
                      label="Se connecter"
                      variant="primary"
                      onPress={handleSubmit}
                      loading={loginLoading}
                      disabled={loginLoading}
                      fullWidth
                      style={styles.loginButton}
                      testID="login-button"
                    />
                  </View>
                )}
              </Formik>
            )}
          </View>
          
          {/* Lien d'inscription */}
          {!showForgotPassword && (
            <View style={styles.registerContainer} testID="register-link-container">
              <Text style={styles.registerText}>
                Vous n'avez pas encore de compte ?
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/register')}
                testID="register-link"
              >
                <Text style={styles.registerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          )}
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
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
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  input: {
    marginBottom: SPACING.medium,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.large,
  },
  forgotPasswordLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
  },
  loginButton: {
    marginTop: SPACING.medium,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.large,
  },
  registerText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.medium,
    marginRight: SPACING.small,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    marginBottom: SPACING.large,
  },
  forgotPasswordTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.small,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
    marginBottom: SPACING.medium,
  },
  forgotPasswordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.medium,
  },
  forgotPasswordButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});