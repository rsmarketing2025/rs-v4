
import { useState, useEffect } from 'react';

interface FormData {
  general: {
    agentName: string;
    description: string;
    defaultLanguage: string;
    voiceTone: string;
  };
  training: {
    uploadedFiles: any[];
    referenceLinks: string[];
    manualContext: string;
    knowledgeBase: any;
  };
  behavior: {
    forbiddenWords: string[];
    defaultResponses: Array<{ question: string; answer: string }>;
    fallbackMessage: string;
    goodResponseExamples: string[];
    responseLimit: number;
  };
  conversationFlow: {
    preDefinedFlows: Array<{ name: string; trigger: string; steps: string[] }>;
    conditions: Array<{ condition: string; action: string }>;
    escalationRules: Array<{ trigger: string; action: string }>;
  };
}

export const useAgentTrainingForm = () => {
  const [formData, setFormData] = useState<FormData>({
    general: {
      agentName: '',
      description: '',
      defaultLanguage: 'pt-BR',
      voiceTone: 'profissional'
    },
    training: {
      uploadedFiles: [],
      referenceLinks: [],
      manualContext: '',
      knowledgeBase: null
    },
    behavior: {
      forbiddenWords: [],
      defaultResponses: [],
      fallbackMessage: '',
      goodResponseExamples: [],
      responseLimit: 500
    },
    conversationFlow: {
      preDefinedFlows: [],
      conditions: [],
      escalationRules: []
    }
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  const saveAsDraft = () => {
    localStorage.setItem('agentTrainingDraft', JSON.stringify(formData));
    console.log('Rascunho salvo localmente:', formData);
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('agentTrainingDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
      console.log('Rascunho carregado:', JSON.parse(draft));
    }
  };

  useEffect(() => {
    loadDraft();
  }, []);

  return {
    formData,
    updateFormData,
    saveAsDraft,
    loadDraft
  };
};
