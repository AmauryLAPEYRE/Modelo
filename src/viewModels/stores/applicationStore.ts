import { create } from 'zustand';
import { ApplicationModel, ApplicationStatus } from '../../domain/entities/ApplicationModel';

interface ApplicationState {
  // État
  applications: ApplicationModel[];
  filteredStatus: ApplicationStatus[];
  selectedApplication: ApplicationModel | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setApplications: (applications: ApplicationModel[]) => void;
  addApplication: (application: ApplicationModel) => void;
  updateApplication: (applicationId: string, updatedData: Partial<ApplicationModel>) => void;
  removeApplication: (applicationId: string) => void;
  
  setSelectedApplication: (application: ApplicationModel | null) => void;
  
  setFilteredStatus: (statusList: ApplicationStatus[]) => void;
  
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getApplicationById: (applicationId: string) => ApplicationModel | undefined;
  getApplicationsForService: (serviceId: string) => ApplicationModel[];
  getModelApplications: (modelId: string) => ApplicationModel[];
  getProfessionalApplications: (professionalId: string) => ApplicationModel[];
  getFilteredApplications: () => ApplicationModel[];
  
  getActiveApplicationsCount: () => number;
  getPendingApplicationsCount: () => number;
}

/**
 * Store Zustand pour gérer les candidatures
 */
export const useApplicationStore = create<ApplicationState>((set, get) => ({
  // État initial
  applications: [],
  filteredStatus: [
    ApplicationStatus.PENDING, 
    ApplicationStatus.ACCEPTED, 
    ApplicationStatus.COMPLETED
  ],
  selectedApplication: null,
  isLoading: false,
  error: null,
  
  // Actions
  setApplications: (applications: ApplicationModel[]) => set({ applications }),
  
  addApplication: (application: ApplicationModel) => set(state => ({
    applications: [...state.applications, application]
  })),
  
  updateApplication: (applicationId: string, updatedData: Partial<ApplicationModel>) => set(state => ({
    applications: state.applications.map(app => 
      app.id === applicationId 
        ? { ...app, ...updatedData } 
        : app
    ),
    // Mettre à jour l'application sélectionnée si nécessaire
    selectedApplication: state.selectedApplication?.id === applicationId
      ? { ...state.selectedApplication, ...updatedData }
      : state.selectedApplication
  })),
  
  removeApplication: (applicationId: string) => set(state => ({
    applications: state.applications.filter(app => app.id !== applicationId),
    // Désélectionner l'application si elle était sélectionnée
    selectedApplication: state.selectedApplication?.id === applicationId
      ? null
      : state.selectedApplication
  })),
  
  setSelectedApplication: (application: ApplicationModel | null) => set({ selectedApplication: application }),
  
  setFilteredStatus: (statusList: ApplicationStatus[]) => set({ filteredStatus: statusList }),
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setError: (error: string | null) => set({ error }),
  
  // Getter pour une candidature par ID
  getApplicationById: (applicationId: string) => {
    return get().applications.find(app => app.id === applicationId);
  },
  
  // Getter pour les candidatures d'une prestation
  getApplicationsForService: (serviceId: string) => {
    return get().applications.filter(app => app.serviceId === serviceId);
  },
  
  // Getter pour les candidatures d'un modèle
  getModelApplications: (modelId: string) => {
    return get().applications.filter(app => app.modelId === modelId);
  },
  
  // Getter pour les candidatures reçues par un professionnel
  getProfessionalApplications: (professionalId: string) => {
    return get().applications.filter(app => app.professionalId === professionalId);
  },
  
  // Getter pour les candidatures filtrées par statut
  getFilteredApplications: () => {
    const { applications, filteredStatus } = get();
    
    return applications.filter(app => filteredStatus.includes(app.status));
  },
  
  // Getter pour le nombre de candidatures actives
  getActiveApplicationsCount: () => {
    const { applications } = get();
    
    return applications.filter(app => 
      app.status === ApplicationStatus.PENDING || 
      app.status === ApplicationStatus.ACCEPTED
    ).length;
  },
  
  // Getter pour le nombre de candidatures en attente
  getPendingApplicationsCount: () => {
    const { applications } = get();
    
    return applications.filter(app => app.status === ApplicationStatus.PENDING).length;
  }
}));