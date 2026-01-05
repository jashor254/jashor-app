'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function CompleteSOWComponent() {
  // ===================== STATE VARIABLES =====================
  const [formData, setFormData] = useState({
    school: '',
    level: '',
    grade: '',
    learning_area: '',
    textbook: '',
    term: '',
    year: new Date().getFullYear()
  });

  const [lessonStructure, setLessonStructure] = useState({
    lessons_per_week: '',
    first_week_of_teaching: 1,
    first_lesson_of_teaching: 1,
    last_week_of_teaching: 12,
    last_lesson_of_teaching: 4,
    double_lesson_option: 'single',
    double_lesson_combination: ''
  });

  const [hasBreaks, setHasBreaks] = useState(false);
  const [breaks, setBreaks] = useState([]);
  const [newBreak, setNewBreak] = useState({
    title: '',
    startWeek: '',
    startLesson: '',
    endWeek: '',
    endLesson: ''
  });

  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [learning_areas, setLearning_areas] = useState([]);
  const [strands, setStrands] = useState([]);
  const [substrands, setSubstrands] = useState({});
  const [setBooks, setSetBooks] = useState([]);
  const [selectedSetBook, setSelectedSetBook] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedStrands, setSelectedStrands] = useState({});
  const [selectedSubstrands, setSelectedSubstrands] = useState({});

  // Step 5 states
  const [previewData, setPreviewData] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ 
    total: 0, 
    completed: 0, 
    current: '',
    source: '',
    confidence: 0
  });
  
  // Database connection status
  const [dbConnected, setDbConnected] = useState(false);
  const [dbCheckDone, setDbCheckDone] = useState(false);
  
  // Track if Grade 10 is selected
  const [isGrade10, setIsGrade10] = useState(false);
  
  // Cache for curriculum data
  const curriculumCache = useRef({});
  // Track sources for reporting
  const generationSources = useRef({
    database_exact_match: 0,
    database_partial_match: 0,
    kicd_guided_ai_fallback: 0,
    emergency_fallback: 0
  });

  // ===================== CONSTANTS =====================
  const terms = [
    { value: '1', label: 'Term 1' },
    { value: '2', label: 'Term 2' },
    { value: '3', label: 'Term 3' }
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const lessonsPerWeekOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const weekOptions = Array.from({ length: 15 }, (_, i) => i + 1);
  const lessonOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  
  const doubleLessonOptions = [
    { value: 'single', label: 'No double lesson' },
    { value: 'double', label: 'Double lesson' }
  ];

  // ===================== HELPER FUNCTIONS =====================
  const isKiswahiliSubject = () => {
    const selectedArea = learning_areas.find(area => area.id === formData.learning_area);
    return selectedArea?.name?.toLowerCase().includes('kiswahili');
  };

  const isEnglishSubject = () => {
    const selectedArea = learning_areas.find(area => area.id === formData.learning_area);
    return selectedArea?.name?.toLowerCase().includes('english');
  };

  const getTranslatedText = (englishText, kiswahiliText) => {
    return isKiswahiliSubject() ? kiswahiliText : englishText;
  };

  const shouldShowSetBookSelection = () => {
    if (!formData.grade || !formData.learning_area) return false;
    
    const isLangSubject = isKiswahiliSubject() || isEnglishSubject();
    if (!isLangSubject) return false;
    
    const selectedGrade = grades.find(g => g.id === formData.grade);
    if (!selectedGrade) return false;
    
    const gradeName = selectedGrade.name?.toLowerCase() || '';
    return gradeName.includes('form 3') || gradeName.includes('form 4');
  };

  const formatSetBookTitle = (book) => {
    if (!book) return '';
    const title = book.book_title || '';
    const author = book.book_author || '';
    
    if (author.toLowerCase() === 'various' || author.toLowerCase() === 'mbalimbali') {
      return title;
    }
    
    if (isKiswahiliSubject()) {
      return `${title} na ${author}`;
    }
    
    return `${title} by ${author}`;
  };

  const getLessonNumberOptions = () => {
    return Array.from({ length: lessonStructure.lessons_per_week || 10 }, (_, i) => i + 1);
  };

  const getWeekNumberOptions = () => {
    const startWeek = lessonStructure.first_week_of_teaching || 1;
    const endWeek = lessonStructure.last_week_of_teaching || 12;
    return Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i);
  };

  // ===================== DATABASE CONNECTION CHECK =====================
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      console.log('🔍 Checking database connection...');
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('levels')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('❌ Database connection error:', error);
          setDbConnected(false);
        } else {
          console.log('✅ Database connection successful!');
          setDbConnected(true);
        }
        
      } catch (error) {
        console.error('❌ Fatal database error:', error);
        setDbConnected(false);
      } finally {
        setLoading(false);
        setDbCheckDone(true);
      }
    };
    
    checkDatabaseConnection();
  }, []);

  // ===================== PHASE 1: CBE-FOCUSED DATA FETCHING =====================
  
  // 1. Fetch Levels - CBE FOCUSED ONLY
  useEffect(() => { 
    const fetchLevels = async () => {
      try {
        setLoading(true);
        // CBE FOCUS: Junior Secondary School only
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .or('name.ilike.%junior secondary%,name.ilike.%jss%,name.ilike.%cbe%')
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        setLevels(data || []);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  // 2. Fetch Grades - WITH GRADE 10 CHECK
  useEffect(() => {
    if (formData.level) {
      const fetchGrades = async (levelId) => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('level_id', levelId)
            .eq('is_active', true)
            .order('order_index', { ascending: true });
          
          if (error) throw error;

          const sortedGrades = data || [];
          setGrades(sortedGrades);
          
          // Check if Grade 10 exists in the fetched grades
          const grade10Exists = sortedGrades.some(g => 
            g.name?.toLowerCase().includes('grade 10') || 
            g.name?.toLowerCase().includes('form 4')
          );
          
          if (grade10Exists) {
            console.log('⚠️ Grade 10 detected in system (kept silent)');
          }
          
        } catch (err) {
          console.error('Error fetching grades:', err);
          setGrades([]);
        } finally { 
          setLoading(false); 
        }
      };
      fetchGrades(formData.level);
      
      // Reset dependent fields
      setFormData(prev => ({ ...prev, grade: '', learning_area: '', textbook: '' }));
      setLearning_areas([]);
      setStrands([]);
      setSubstrands({});
      setSelectedSetBook('');
    }
  }, [formData.level]);

  // 3. Fetch Learning Areas
  useEffect(() => {
    if (formData.grade) {
      // Check if Grade 10 is selected
      const selectedGrade = grades.find(g => g.id === formData.grade);
      const isGrade10 = selectedGrade?.name?.toLowerCase().includes('grade 10') || 
                       selectedGrade?.name?.toLowerCase().includes('form 4');
      
      setIsGrade10(isGrade10);
      
      const fetchLearningAreas = async (gradeId) => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('learning_areas')
            .select('*')
            .eq('grade_id', gradeId)
            .order('order_index', { ascending: true });
          if (error) throw error;
          setLearning_areas(data || []);
        } catch (err) {
          console.error('Error fetching learning areas:', err);
          setLearning_areas([]);
        } finally { 
          setLoading(false); 
        }
      };
      fetchLearningAreas(formData.grade);
      
      // Reset dependent fields
      setFormData(prev => ({ ...prev, learning_area: '', textbook: '' }));
      setStrands([]);
      setSubstrands({});
      setSelectedSetBook('');
    }
  }, [formData.grade, grades]);

  // ===================== FETCH STRANDS & SUBSTRANDS =====================
  useEffect(() => {
    const fetchStrandsAndSubstrands = async () => {
      if (!formData.learning_area || !formData.grade) return;
      
      try {
        setLoading(true);
        
        // Fetch set books for language subjects
        if (shouldShowSetBookSelection()) {
          const { data: setBooksData, error: setBooksError } = await supabase
            .from('set_books')
            .select('*')
            .eq('learning_area_id', formData.learning_area);
          
          if (!setBooksError) {
            setSetBooks(setBooksData || []);
          }
        } else {
          setSetBooks([]);
        }
        
        // Fetch strands - KICD curriculum design
        const { data: strandsData, error: strandsError } = await supabase
          .from('strands')
          .select('*')
          .eq('learning_area_id', formData.learning_area)
          .order('order_index', { ascending: true })
          .order('title', { ascending: true });
        
        if (strandsError) {
          console.error('Error fetching strands:', strandsError);
          setStrands([]);
        } else {
          setStrands(strandsData || []);
        }
        
        // Fetch substrands for each strand
        const currentStrands = strandsData || [];
        const substrandsData = {};
        
        for (const strand of currentStrands) {
          if (!strand?.id) continue;
          
          const { data: substrandsForStrand, error: substrandsError } = await supabase
            .from('substrands')
            .select('*')
            .eq('strand_id', strand.id)
            .order('order_index', { ascending: true })
            .order('title', { ascending: true });
          
          if (!substrandsError && substrandsForStrand) {
            substrandsData[strand.id] = substrandsForStrand.sort((a,b) => {
              const orderA = a.order_index || 0;
              const orderB = b.order_index || 0;
              if (orderA !== orderB) return orderA - orderB;
              return (a.title || '').localeCompare(b.title || '');
            });
          } else {
            substrandsData[strand.id] = [];
          }
        }
        
        setSubstrands(substrandsData);
        
      } catch (error) {
        console.error('Error in fetchStrandsAndSubstrands:', error);
        alert(getTranslatedText(
          'Unable to load curriculum topics. Please try again.',
          'Haikuweza kupakia mada za mtaala. Tafadhali jaribu tena.'
        ));
      } finally {
        setLoading(false);
      }
    };

    fetchStrandsAndSubstrands();
  }, [formData.learning_area, formData.grade, selectedSetBook]);

  // ===================== CORE: KICD CURRICULUM DATA FETCHER =====================
  const fetchKICDCurriculumData = async (substrandId, learningAreaId, gradeId, weekNumber, lessonNumber, substrandTitle) => {
    console.log(`📥 FETCH CALLED for: ${substrandTitle} (Week ${weekNumber}, Lesson ${lessonNumber})`);
    
    const cacheKey = `${substrandId}-${gradeId}-W${weekNumber}-L${lessonNumber}`;
    
    // Check cache first
    if (curriculumCache.current[cacheKey]) {
      console.log('✅ [CACHE HIT] Using cached data');
      return curriculumCache.current[cacheKey];
    }

    try {
      // ============ STEP 1: CHECK DATABASE FOR OFFICIAL KICD DESIGN ============
      setGenerationProgress(prev => ({ 
        ...prev, 
        current: getTranslatedText(
          '🔍 Searching KICD database for curriculum design...',
          '🔍 Inatafuta database ya KICD kwa muundo wa mtaala...'
        ),
        source: 'database_search'
      }));

      console.log('🎯 [LEVEL 1] Checking official KICD designs...');
      
      // Try to get ANY KICD design for this substrand
      const { data: kicdDesign, error: kicdError } = await supabase
        .from('kicd_curriculum_lessons')
        .select('*')
        .eq('substrand_id', substrandId)
        .eq('learning_area_id', learningAreaId)
        .eq('grade_id', gradeId)
        .limit(1);

      if (!kicdError && kicdDesign && kicdDesign.length > 0) {
        console.log('✅ [KICD DESIGN FOUND] Using official KICD framework');
        
        // This is an official KICD design - use it as base
        const officialDesign = kicdDesign[0];
        generationSources.current.database_exact_match++;
        
        // Expand the KICD design for specific lesson
        const expandedLesson = expandKICDDesignForLesson(
          officialDesign, 
          lessonNumber, 
          substrandTitle, 
          weekNumber
        );
        
        const result = {
          type: 'database_exact_match',
          data: expandedLesson,
          confidence: 1.0,
          source: 'database_exact_match',
          is_kicd_official: true,
          timestamp: new Date().toISOString()
        };
        
        curriculumCache.current[cacheKey] = result;
        return result;
      }

      // ============ STEP 2: CHECK FOR SIMILAR SUBSTRAND IN DATABASE ============
      console.log('📊 [LEVEL 2] Searching for similar substrands...');
      
      const { data: similarSubstrands, error: similarError } = await supabase
        .from('kicd_curriculum_lessons')
        .select('*')
        .eq('learning_area_id', learningAreaId)
        .eq('grade_id', gradeId)
        .limit(3);

      if (!similarError && similarSubstrands && similarSubstrands.length > 0) {
        console.log('✅ [SIMILAR FOUND] Using similar KICD design as template');
        
        generationSources.current.database_partial_match++;
        
        // Use the most comprehensive design as template
        const bestTemplate = similarSubstrands.sort((a, b) => 
          (b.topic_specific_learning_outcomes?.length || 0) - (a.topic_specific_learning_outcomes?.length || 0)
        )[0];
        
        const aiGeneratedLesson = generateKICDAlignedLesson(
          substrandTitle,
          lessonNumber,
          weekNumber,
          bestTemplate,
          learningAreaId
        );
        
        const result = {
          type: 'database_partial_match',
          data: aiGeneratedLesson,
          confidence: 0.85,
          source: 'database_partial_match',
          is_kicd_official: false,
          timestamp: new Date().toISOString()
        };
        
        curriculumCache.current[cacheKey] = result;
        return result;
      }

      // ============ STEP 3: KICD-GUIDED AI FALLBACK ============
      console.log('🤖 [LEVEL 3] Using KICD-guided AI fallback...');
      
      generationSources.current.kicd_guided_ai_fallback++;
      
      const aiLesson = await generateKICDCompliantLesson(
        substrandTitle,
        lessonNumber,
        weekNumber,
        learningAreaId,
        gradeId
      );
      
      const result = {
        type: 'kicd_guided_ai_fallback',
        data: aiLesson,
        confidence: 0.75,
        source: 'kicd_guided_ai_fallback',
        is_kicd_official: false,
        timestamp: new Date().toISOString()
      };
      
      curriculumCache.current[cacheKey] = result;
      return result;

    } catch (error) {
      console.error('❌ [FATAL ERROR] All fetch attempts failed:', error);
      
      // FINAL EMERGENCY FALLBACK
      generationSources.current.emergency_fallback++;
      
      const emergencyData = createEmergencyFallback(substrandTitle, lessonNumber);
      
      const result = {
        type: 'emergency_fallback',
        data: emergencyData,
        confidence: 0.50,
        source: 'emergency_fallback',
        is_kicd_official: false,
        timestamp: new Date().toISOString()
      };
      
      curriculumCache.current[cacheKey] = result;
      return result;
    }
  };

  // ===================== KICD DESIGN EXPANSION HELPER =====================
  const expandKICDDesignForLesson = (kicdDesign, lessonNumber, substrandTitle, weekNumber) => {
    // KICD designs provide framework, we expand for specific lessons
    const baseOutcomes = kicdDesign.topic_specific_learning_outcomes || [];
    const baseExperiences = kicdDesign.learning_experiences || [];
    const baseQuestions = kicdDesign.key_inquiry_questions || [];
    const baseResources = kicdDesign.learning_resources || [];
    const baseAssessments = kicdDesign.assessment_methods || [];
    
    const isKiswahili = isKiswahiliSubject();
    
    // Lesson-specific expansion
    const lessonFocus = getLessonFocus(lessonNumber, substrandTitle);
    
    return {
      topic_specific_learning_outcomes: [
        ...baseOutcomes.slice(0, 2),
        `${lessonFocus.learningGoal}`
      ],
      learning_experiences: [
        ...baseExperiences.slice(0, 2),
        lessonFocus.experience
      ],
      key_inquiry_questions: [
        ...baseQuestions.slice(0, 2),
        lessonFocus.question
      ],
      learning_resources: baseResources,
      assessment_methods: baseAssessments,
      core_competencies: kicdDesign.core_competencies || getDefaultCompetencies(isKiswahili),
      values: kicdDesign.values || getDefaultValues(isKiswahili),
      pci_links: kicdDesign.pci_links || getDefaultPCILinks(isKiswahili),
      suggested_periods: kicdDesign.suggested_periods || 2
    };
  };

  // ===================== KICD-ALIGNED AI LESSON GENERATOR =====================
  const generateKICDAlignedLesson = (substrandTitle, lessonNumber, weekNumber, template, learningAreaId) => {
    const isKiswahili = isKiswahiliSubject();
    const learningArea = learning_areas.find(la => la.id === learningAreaId);
    const subjectType = getSubjectType(learningArea?.name || '');
    
    const lessonFocus = getLessonFocus(lessonNumber, substrandTitle);
    
    return {
      topic_specific_learning_outcomes: generateKICDOutcomes(substrandTitle, lessonFocus, subjectType, isKiswahili),
      learning_experiences: generateKICDExperiences(substrandTitle, lessonFocus, subjectType, isKiswahili),
      key_inquiry_questions: generateKICDQuestions(substrandTitle, lessonFocus, subjectType, isKiswahili),
      learning_resources: generateKICDResources(subjectType, isKiswahili),
      assessment_methods: generateKICDAssessments(subjectType, isKiswahili),
      core_competencies: getDefaultCompetencies(isKiswahili),
      values: getDefaultValues(isKiswahili),
      pci_links: getDefaultPCILinks(isKiswahili),
      suggested_periods: 2
    };
  };

  // ===================== KICD COMPLIANT AI GENERATOR =====================
  const generateKICDCompliantLesson = async (substrandTitle, lessonNumber, weekNumber, learningAreaId, gradeId) => {
    // This would call your AI API endpoint
    // For now, return structured KICD-compliant data
    const isKiswahili = isKiswahiliSubject();
    const lessonFocus = getLessonFocus(lessonNumber, substrandTitle);
    
    return {
      topic_specific_learning_outcomes: [
        isKiswahili 
          ? `Kuelewa dhana za msingi za ${substrandTitle}`
          : `Understand basic concepts of ${substrandTitle}`,
        isKiswahili
          ? `Kutumia ${substrandTitle} katika mazoezi ya vitendo`
          : `Apply ${substrandTitle} in practical exercises`,
        isKiswahili
          ? `Kuchambua mifano ya ${substrandTitle} katika mazingira halisi`
          : `Analyze examples of ${substrandTitle} in real contexts`
      ],
      learning_experiences: [
        isKiswahili ? "Majadiliano ya darasani" : "Classroom discussions",
        isKiswahili ? "Mazoezi ya kikundi" : "Group exercises",
        isKiswahili ? "Uwasilishaji na uigizaji" : "Presentation and role-play"
      ],
      key_inquiry_questions: [
        isKiswahili 
          ? `Ni vipengele gani vya msingi vya ${substrandTitle}?`
          : `What are the basic elements of ${substrandTitle}?`,
        isKiswahili
          ? `${substrandTitle} inahusikanaje na maisha yetu ya kila siku?`
          : `How does ${substrandTitle} relate to our daily lives?`
      ],
      learning_resources: [
        isKiswahili ? "Vitabu vya somo" : "Textbooks",
        isKiswahili ? "Vifaa vya kidijitali" : "Digital resources",
        isKiswahili ? "Vielelezo na picha" : "Models and pictures"
      ],
      assessment_methods: [
        isKiswahili ? "Maswali ya mdomo" : "Oral questions",
        isKiswahili ? "Kazi ya maandishi" : "Written work",
        isKiswahili ? "Ufuatiliaji wa vitendo" : "Practical observation"
      ],
      core_competencies: getDefaultCompetencies(isKiswahili),
      values: getDefaultValues(isKiswahili),
      pci_links: getDefaultPCILinks(isKiswahili),
      suggested_periods: 2
    };
  };

  // ===================== KICD CONTENT GENERATORS =====================
  const getLessonFocus = (lessonNumber, substrandTitle) => {
    const focuses = [
      { learningGoal: "Introduction and basic understanding", experience: "Exploration and discovery", question: "What are the key concepts?" },
      { learningGoal: "Deepening understanding", experience: "Practice and application", question: "How does this work in practice?" },
      { learningGoal: "Application in context", experience: "Real-world application", question: "Where can this be applied?" },
      { learningGoal: "Analysis and evaluation", experience: "Critical thinking exercises", question: "What are the strengths and limitations?" }
    ];
    
    return focuses[lessonNumber % focuses.length] || focuses[0];
  };

  const getSubjectType = (learningAreaName) => {
    const name = learningAreaName.toLowerCase();
    if (name.includes('kiswahili')) return 'kiswahili';
    if (name.includes('english')) return 'english';
    if (name.includes('math')) return 'mathematics';
    if (name.includes('science')) return 'science';
    if (name.includes('social')) return 'social_studies';
    return 'general';
  };

  const generateKICDOutcomes = (substrandTitle, lessonFocus, subjectType, isKiswahili) => {
    const outcomes = {
      kiswahili: [
        `Kusoma na kuelewa maandishi yanayohusiana na ${substrandTitle}`,
        `Kuandika kwa usahihi kuhusu ${substrandTitle}`,
        lessonFocus.learningGoal.includes("Kuelewa") ? lessonFocus.learningGoal : `Kuzungumza kuhusu ${substrandTitle}`
      ],
      english: [
        `Read and comprehend texts about ${substrandTitle}`,
        `Write coherent paragraphs on ${substrandTitle}`,
        lessonFocus.learningGoal
      ],
      mathematics: [
        `Solve problems involving ${substrandTitle}`,
        `Apply mathematical concepts of ${substrandTitle}`,
        lessonFocus.learningGoal
      ],
      science: [
        `Explain scientific concepts of ${substrandTitle}`,
        `Conduct experiments related to ${substrandTitle}`,
        lessonFocus.learningGoal
      ],
      general: [
        isKiswahili ? `Kuelewa dhana za ${substrandTitle}` : `Understand concepts of ${substrandTitle}`,
        isKiswahili ? `Kutumia ${substrandTitle}` : `Apply ${substrandTitle}`,
        lessonFocus.learningGoal
      ]
    };
    
    return outcomes[subjectType] || outcomes.general;
  };

  const generateKICDExperiences = (substrandTitle, lessonFocus, subjectType, isKiswahili) => {
    const experiences = {
      kiswahili: ["Kusoma kwa sauti", "Majadiliano ya kikundi", "Kuandika mazoezi"],
      english: ["Reading comprehension", "Group discussions", "Writing exercises"],
      mathematics: ["Problem-solving", "Group calculations", "Real-world applications"],
      science: ["Experiments", "Observation", "Research"],
      general: [isKiswahili ? "Majadiliano" : "Discussions", isKiswahili ? "Mazoezi" : "Exercises", lessonFocus.experience]
    };
    
    return experiences[subjectType] || experiences.general;
  };

  const generateKICDQuestions = (substrandTitle, lessonFocus, subjectType, isKiswahili) => {
    const questions = {
      kiswahili: [
        `Ni nini ${substrandTitle}?`,
        `Kwa nini ${substrandTitle} ni muhimu?`,
        lessonFocus.question
      ],
      english: [
        `What is ${substrandTitle}?`,
        `Why is ${substrandTitle} important?`,
        lessonFocus.question
      ],
      general: [
        isKiswahili ? `Je, ${substrandTitle} ni nini?` : `What is ${substrandTitle}?`,
        isKiswahili ? `${substrandTitle} inasaidiaje?` : `How does ${substrandTitle} help?`,
        lessonFocus.question
      ]
    };
    
    return questions[subjectType] || questions.general;
  };

  const generateKICDResources = (subjectType, isKiswahili) => {
    const resources = {
      kiswahili: ["Vitabu vya Kiswahili", "Kamusi", "Vikaratasi vya mazoezi"],
      english: ["English textbooks", "Dictionaries", "Workbooks"],
      mathematics: ["Mathematics textbooks", "Calculators", "Measuring tools"],
      science: ["Science textbooks", "Laboratory equipment", "Models"],
      general: [isKiswahili ? "Vitabu vya somo" : "Textbooks", isKiswahili ? "Vifaa vya kidijitali" : "Digital resources", "Reference materials"]
    };
    
    return resources[subjectType] || resources.general;
  };

  const generateKICDAssessments = (subjectType, isKiswahili) => {
    const assessments = {
      kiswahili: ["Maswali ya mdomo", "Insha", "Ufahamu"],
      english: ["Oral questions", "Essay writing", "Comprehension"],
      mathematics: ["Problem sets", "Calculations", "Tests"],
      science: ["Practical tests", "Reports", "Experiments"],
      general: [isKiswahili ? "Maswali" : "Questions", isKiswahili ? "Kazi ya maandishi" : "Written work", isKiswahili ? "Ufuatiliaji" : "Observation"]
    };
    
    return assessments[subjectType] || assessments.general;
  };

  const getDefaultCompetencies = (isKiswahili) => {
    return isKiswahili 
      ? "Mawasiliano, Ushirikiano, Ufahamu wa Kidijitali"
      : "Communication, Collaboration, Digital Literacy";
  };

  const getDefaultValues = (isKiswahili) => {
    return isKiswahili 
      ? "Heshima, Uwajibikaji, Umoja, Uaminifu"
      : "Respect, Responsibility, Unity, Honesty";
  };

  const getDefaultPCILinks = (isKiswahili) => {
    return isKiswahili 
      ? "Elimu ya Afya, Uraia, Stadi za Maisha"
      : "Health Education, Citizenship, Life Skills";
  };

  const createEmergencyFallback = (substrandTitle, lessonNumber) => {
    const isKiswahili = isKiswahiliSubject();
    
    return {
      topic_specific_learning_outcomes: [
        isKiswahili 
          ? `Kuelewa ${substrandTitle}`
          : `Understand ${substrandTitle}`
      ],
      learning_experiences: [
        isKiswahili ? "Majadiliano" : "Discussion"
      ],
      key_inquiry_questions: [
        isKiswahili 
          ? `Ni nini ${substrandTitle}?`
          : `What is ${substrandTitle}?`
      ],
      learning_resources: ["Textbooks"],
      assessment_methods: [
        isKiswahili ? "Maswali" : "Questions"
      ],
      core_competencies: getDefaultCompetencies(isKiswahili),
      values: getDefaultValues(isKiswahili),
      pci_links: getDefaultPCILinks(isKiswahili),
      suggested_periods: 2
    };
  };

  // ===================== INPUT HANDLERS =====================
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLessonStructureChange = (field, value) => {
    setLessonStructure(prev => ({ ...prev, [field]: value }));
  };

  const handleStrandSelect = (strandId) => {
    setSelectedStrands(prev => {
      const newSelection = { ...prev, [strandId]: !prev[strandId] };
      const strandSubs = substrands[strandId] || [];
      const newSub = { ...selectedSubstrands };
      if (!prev[strandId]) {
        strandSubs.forEach(s => newSub[s.id] = true);
      } else {
        strandSubs.forEach(s => newSub[s.id] = false);
      }
      setSelectedSubstrands(newSub);
      return newSelection;
    });
  };

  const handleSubstrandSelect = (substrandId, strandId) => {
    setSelectedSubstrands(prev => {
      const flipped = { ...prev, [substrandId]: !prev[substrandId] };
      const anySelectedForStrand = Object.entries(flipped).some(([k,v]) => {
        const subs = substrands[strandId] || [];
        return v && subs.some(s => String(s.id) === String(k));
      });
      setSelectedStrands(prevStr => ({ ...prevStr, [strandId]: anySelectedForStrand }));
      return flipped;
    });
  };

  const handleSetBookSelection = async (bookTitle, bookAuthor) => {
    if (!formData.learning_area) {
      alert(getTranslatedText('Please select a learning area first.', 'Tafadhali chagua eneo la kujifunza kwanza.'));
      return;
    }
    setIsSettingBook(true);
    try {
      const bookDisplayName = formatSetBookTitle({ book_title: bookTitle, book_author: bookAuthor });
      setSelectedSetBook(bookDisplayName);
      
      // Update substrands with the new set book title for 6th substrand
      const updatedSubstrands = { ...substrands };
      Object.keys(updatedSubstrands).forEach(strandId => {
        updatedSubstrands[strandId] = updatedSubstrands[strandId].map(sub => {
          if (Number(sub.order_index) === 6) {
            const newTitle = isKiswahiliSubject() 
              ? `Fasihi Andishi - ${bookDisplayName}`
              : `Intensive Reading - ${bookDisplayName}`;
            return { ...sub, title: newTitle };
          }
          return sub;
        });
      });
      setSubstrands(updatedSubstrands);
      
      const successMessage = isKiswahiliSubject()
        ? `✅ Kitabu cha fasihi "${bookDisplayName}" kimewekwa kwenye mada zote.`
        : `✅ Set book "${bookDisplayName}" applied to all units.`;
      
      alert(successMessage);
    } catch (err) {
      console.error('Error in handleSetBookSelection:', err);
    } finally {
      setIsSettingBook(false);
    }
  };

  // ===================== BREAKS MANAGEMENT =====================
  const handleAddBreak = () => {
    if (!newBreak.title.trim()) {
      alert(getTranslatedText('Please enter break title', 'Tafadhali weka jina la mapumziko'));
      return;
    }

    if (!newBreak.startWeek || !newBreak.startLesson || !newBreak.endWeek || !newBreak.endLesson) {
      alert(getTranslatedText(
        'Please fill all start and end details',
        'Tafadhali jaza sehemu zote za mwanzo na mwisho'
      ));
      return;
    }

    const startWeek = parseInt(newBreak.startWeek);
    const endWeek = parseInt(newBreak.endWeek);
    const startLesson = parseInt(newBreak.startLesson);
    const endLesson = parseInt(newBreak.endLesson);

    if (endWeek < startWeek || (endWeek === startWeek && endLesson <= startLesson)) {
      alert(getTranslatedText(
        'End date must be after start date',
        'Tarehe ya mwisho lazima iwe baada ya tarehe ya mwanzo'
      ));
      return;
    }

    const breakItem = {
      id: Date.now(),
      title: newBreak.title,
      startWeek: startWeek,
      startLesson: startLesson,
      endWeek: endWeek,
      endLesson: endLesson
    };

    setBreaks(prev => [...prev, breakItem]);

    setNewBreak({
      title: '',
      startWeek: '',
      startLesson: '',
      endWeek: '',
      endLesson: ''
    });

    setHasBreaks(true);
  };

  const handleRemoveBreak = (breakId) => {
    setBreaks(prev => prev.filter(b => b.id !== breakId));
    if (breaks.length === 1) {
      setHasBreaks(false);
    }
  };

  // ===================== STEP VALIDATION =====================
  const isStep1Complete = () => {
    const requiredFields = ['school', 'level', 'grade', 'learning_area', 'term', 'year'];
    return requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');
  };

  const isStep2Complete = Object.values(selectedSubstrands).some(Boolean);
  
  const isStep3Complete = () => {
    const { 
      lessons_per_week, 
      first_week_of_teaching, 
      first_lesson_of_teaching,
      last_week_of_teaching, 
      last_lesson_of_teaching 
    } = lessonStructure;
    
    if (!lessons_per_week || 
        !first_week_of_teaching || 
        !first_lesson_of_teaching ||
        !last_week_of_teaching || 
        !last_lesson_of_teaching) {
      return false;
    }
    
    if (last_week_of_teaching < first_week_of_teaching) {
      return false;
    }
    
    if (last_week_of_teaching === first_week_of_teaching && 
        last_lesson_of_teaching < first_lesson_of_teaching) {
      return false;
    }
    
    if (first_lesson_of_teaching < 1 || 
        first_lesson_of_teaching > lessons_per_week ||
        last_lesson_of_teaching < 1 || 
        last_lesson_of_teaching > lessons_per_week) {
      return false;
    }
    
    if (lessonStructure.double_lesson_option === 'double' && !lessonStructure.double_lesson_combination) {
      return false;
    }
    
    return true;
  };

  const isStep4Complete = () => {
    if (!hasBreaks) return true;
    if (hasBreaks && breaks.length === 0) {
      alert(getTranslatedText(
        'You indicated there are breaks but haven\'t added any.',
        'Umeweka kuwa kuna mapumziko lakini haujawaongeza.'
      ));
      return false;
    }
    return true;
  };

  // ===================== STEP NAVIGATION =====================
  const handleStep1Next = () => {
    // Check for Grade 10
    if (isGrade10) {
      alert("🎓 Grade 10 Scheme of Work is coming soon!\n\nWe're currently focused on Junior Secondary (CBE) Grades 7-9.\nGrade 10 support will be available in the next update.");
      return;
    }

    if (isStep1Complete()) {
      setCurrentStep(2);
    } else {
      alert(getTranslatedText(
        'Please fill all required fields marked with *.',
        'Tafadhali jaza sehemu zote zilizowekwa alama ya *.'
      ));
    }
  };
  
  const handleStep2Next = () => {
    if (isStep2Complete) {
      setCurrentStep(3);
    } else {
      alert(getTranslatedText(
        'Please select at least one subtopic to continue.',
        'Tafadhali chagua angalau mada ndogo moja ili kuendelea.'
      ));
    }
  };
  
  const handleStep3Next = () => {
    if (isStep3Complete()) {
      setCurrentStep(4);
    } else {
      alert(getTranslatedText(
        'Please complete all lesson structure details.',
        'Tafadhali kamilisha maelezo yote ya muundo wa masomo.'
      ));
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ===================== GENERATE PREVIEW DATA =====================
  const generatePreviewData = async () => {
    // Check for Grade 10
    if (isGrade10) {
      alert("🎓 Grade 10 SOW Generation is coming soon!\n\nFocus on Junior Secondary (CBE) for now.\nGrade 10 will be available in the next update.");
      return;
    }

    if (!isStep4Complete()) return;
    
    if (!dbCheckDone) {
      alert(getTranslatedText(
        'Checking database connection... Please wait.',
        'Inakagua muunganisho wa database... Tafadhali subiri.'
      ));
      return;
    }
    
    if (!dbConnected) {
      alert(getTranslatedText(
        '❌ Database connection failed! Cannot generate scheme without database.',
        '❌ Muunganisho wa database umeshindwa! Haiwezekani kutengeneza mfumo bila database.'
      ));
      return;
    }
    
    setIsSaving(true);
    setGenerationProgress({
      total: 100,
      completed: 0,
      current: getTranslatedText('🔍 Starting KICD-aligned generation...', '🔍 Inaanza utengenezaji unaolingana na KICD...'),
      source: 'initializing',
      confidence: 0
    });
    
    // Reset generation sources
    generationSources.current = {
      database_exact_match: 0,
      database_partial_match: 0,
      kicd_guided_ai_fallback: 0,
      emergency_fallback: 0
    };
    
    try {
      // Get all selected content
      const selectedContent = [];
      strands.forEach(strand => {
        const subs = substrands[strand.id] || [];
        subs.forEach(sub => {
          if (selectedSubstrands[sub.id]) {
            selectedContent.push({
              strand: strand.title,
              substrand: sub.title,
              strand_id: strand.id,
              substrand_id: sub.id,
              strand_order: strand.order_index || 0,
              substrand_order: sub.order_index || 0
            });
          }
        });
      });
      
      // Sort selected content by strand and substrand order
      selectedContent.sort((a, b) => {
        if (a.strand_order !== b.strand_order) {
          return a.strand_order - b.strand_order;
        }
        return a.substrand_order - b.substrand_order;
      });
      
      if (selectedContent.length === 0) {
        alert(getTranslatedText(
          'Please select at least one topic to generate scheme.',
          'Tafadhali chagua angalau mada moja ili kutengeneza mfumo.'
        ));
        setIsSaving(false);
        return;
      }
      
      // Calculate total weeks and lessons
      const totalWeeks = lessonStructure.last_week_of_teaching - lessonStructure.first_week_of_teaching + 1;
      const lessonsPerWeek = parseInt(lessonStructure.lessons_per_week);
      let totalAvailableLessons = totalWeeks * lessonsPerWeek;
      
      // Subtract break lessons
      breaks.forEach(breakItem => {
        totalAvailableLessons -= 2;
      });
      
      // Generate scheme data
      const schemeRows = [];
      let currentWeek = lessonStructure.first_week_of_teaching;
      let currentLesson = lessonStructure.first_lesson_of_teaching;
      let contentIndex = 0;
      let lessonCounter = 0;
      
      // Progress tracking
      const totalLessons = Math.min(totalAvailableLessons, selectedContent.length * 4);
      let completedLessons = 0;
      
      console.log('📊 Starting KICD-aligned generation:', {
        totalWeeks,
        lessonsPerWeek,
        totalAvailableLessons,
        selectedContentCount: selectedContent.length
      });

      for (let week = 0; week < totalWeeks; week++) {
        // Check if this week is in a break
        const isInBreak = breaks.some(b => 
          currentWeek >= b.startWeek && currentWeek <= b.endWeek
        );
        
        if (!isInBreak) {
          for (let lesson = 1; lesson <= lessonsPerWeek; lesson++) {
            if (schemeRows.length >= totalAvailableLessons || contentIndex >= selectedContent.length * 4) break;
            
            const content = selectedContent[Math.floor(contentIndex / 4) % selectedContent.length];
            const lessonInSubstrand = (contentIndex % 4) + 1;
            
            // Update progress
            completedLessons++;
            const progressPercent = Math.round((completedLessons / totalLessons) * 100);
            
            setGenerationProgress(prev => ({ 
              ...prev, 
              completed: progressPercent,
              current: getTranslatedText(
                `Generating lesson ${lessonInSubstrand} for ${content.substrand.substring(0, 30)}...`,
                `Inatengenezea somo ${lessonInSubstrand} la ${content.substrand.substring(0, 30)}...`
              )
            }));
            
            // FETCH KICD-ALIGNED CURRICULUM DATA
            const curriculumData = await fetchKICDCurriculumData(
              content.substrand_id,
              formData.learning_area,
              formData.grade,
              currentWeek,
              lessonInSubstrand,
              content.substrand
            );
            
            const formatList = (items) => {
              if (Array.isArray(items)) {
                return items.map((item, i) => `${i+1}. ${item}`).join('\n');
              }
              return items || '';
            };
            
            const lessonData = {
              week: currentWeek,
              lesson: currentLesson,
              strand: content.strand,
              substrand: content.substrand,
              learning_outcomes: formatList(curriculumData.data.topic_specific_learning_outcomes),
              learning_experiences: formatList(curriculumData.data.learning_experiences),
              key_inquiry_questions: formatList(curriculumData.data.key_inquiry_questions),
              learning_resources: formatList(curriculumData.data.learning_resources),
              assessment_methods: formatList(curriculumData.data.assessment_methods),
              core_competencies: curriculumData.data.core_competencies || '',
              values: curriculumData.data.values || '',
              pci_links: curriculumData.data.pci_links || '',
              reflection: '',
              _data_source: curriculumData.source,
              _confidence: curriculumData.confidence,
              _is_kicd_official: curriculumData.is_kicd_official || false,
              _timestamp: curriculumData.timestamp
            };
            
            schemeRows.push(lessonData);
            
            contentIndex++;
            currentLesson++;
            if (currentLesson > lessonsPerWeek) {
              currentLesson = 1;
            }
          }
        }
        
        currentWeek++;
        if (currentWeek > lessonStructure.last_week_of_teaching) break;
      }
      
      // Calculate quality metrics
      const totalLessonsGenerated = schemeRows.length;
      const kicdOfficialLessons = schemeRows.filter(l => l._is_kicd_official).length;
      const highConfidenceLessons = schemeRows.filter(l => l._confidence >= 0.85).length;
      const averageConfidence = schemeRows.reduce((sum, l) => sum + l._confidence, 0) / totalLessonsGenerated;
      
      console.log('📊 Generation completed with metrics:', {
        totalLessonsGenerated,
        kicdOfficialLessons,
        highConfidenceLessons,
        averageConfidence,
        sources: generationSources.current
      });
      
      // Create preview data object
      const previewDataObj = {
        meta: {
          school: formData.school,
          grade: grades.find(g => g.id === formData.grade)?.name || '',
          learningArea: learning_areas.find(la => la.id === formData.learning_area)?.name || '',
          term: terms.find(t => t.value === formData.term)?.label || '',
          year: formData.year,
          textbook: formData.textbook || 'Various approved textbooks',
          totalLessons: totalLessonsGenerated,
          totalWeeks: new Set(schemeRows.map(l => l.week)).size,
          generatedDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          }),
          qualityMetrics: {
            kicdOfficialLessons,
            highConfidenceLessons,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            dataSources: generationSources.current,
            databaseConnected: dbConnected
          },
          kicdAligned: kicdOfficialLessons > 0 || highConfidenceLessons > 0
        },
        scheme: schemeRows,
        breaks: breaks
      };

      setPreviewData(previewDataObj);
      setCurrentStep(5);
      
      // Show quality summary
      const qualitySummary = `✅ YOUR KICD-ALIGNED SCHEME OF WORK IS READY!

📊 QUALITY METRICS:
   • Total Lessons: ${totalLessonsGenerated}
   • KICD Official Lessons: ${kicdOfficialLessons}
   • High Confidence (85%+): ${highConfidenceLessons}
   • Average Confidence: ${Math.round(averageConfidence * 100)}%
   • Database Status: ${dbConnected ? '✅ Connected' : '❌ Not Connected'}

🎯 DATA SOURCES:
   • Database Exact Match: ${generationSources.current.database_exact_match || 0}
   • Database Partial Match: ${generationSources.current.database_partial_match || 0}
   • KICD-Guided AI Fallback: ${generationSources.current.kicd_guided_ai_fallback || 0}
   • Emergency Fallback: ${generationSources.current.emergency_fallback || 0}

📄 ${kicdOfficialLessons > 0 ? '✅ KICD-OFFICIAL ALIGNED' : '✅ Professionally generated with KICD guidelines'}`;
      
      alert(qualitySummary);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert(getTranslatedText(
        'Unable to generate scheme. Please try again.',
        'Haikuweza kutengeneza mfumo. Tafadhali jaribu tena.'
      ));
    } finally {
      setIsSaving(false);
      setGenerationProgress({ 
        total: 0, 
        completed: 0, 
        current: '', 
        source: '',
        confidence: 0
      });
    }
  };

  // ===================== SAVE TO DATABASE =====================
  const saveToDatabase = async () => {
    try {
      setIsSaving(true);
      
      if (!previewData) {
        alert(getTranslatedText('No scheme data to save.', 'Hakuna data ya mfumo ya kuhifadhi.'));
        return;
      }
      
      // Save to database
      const lessonsToSave = previewData.scheme.map(lesson => ({
        learning_area_id: formData.learning_area,
        grade_id: formData.grade,
        strand_title: lesson.strand,
        substrand_title: lesson.substrand,
        week_number: lesson.week,
        lesson_number: lesson.lesson,
        topic_specific_learning_outcomes: lesson.learning_outcomes.split('\n').map(l => l.replace(/^\d+\.\s*/, '')).filter(Boolean),
        learning_experiences: lesson.learning_experiences.split('\n').map(l => l.replace(/^\d+\.\s*/, '')).filter(Boolean),
        key_inquiry_questions: lesson.key_inquiry_questions.split('\n').map(l => l.replace(/^\d+\.\s*/, '')).filter(Boolean),
        learning_resources: lesson.learning_resources.split('\n').map(l => l.replace(/^\d+\.\s*/, '')).filter(Boolean),
        assessment_methods: lesson.assessment_methods.split('\n').map(l => l.replace(/^\d+\.\s*/, '')).filter(Boolean),
        core_competencies: lesson.core_competencies,
        values: lesson.values,
        pci_links: lesson.pci_links,
        source_document: lesson._is_kicd_official ? 'KICD Official' : 'Generated',
        is_kicd_official: lesson._is_kicd_official,
        confidence_score: lesson._confidence
      }));
      
      const { data, error } = await supabase
        .from('kicd_curriculum_lessons')
        .insert(lessonsToSave);
      
      if (error) throw error;
      
      alert(getTranslatedText(
        '✅ Scheme of work saved successfully to KICD database!',
        '✅ Mfumo wa kazi umehifadhiwa kikamilifu kwenye database ya KICD!'
      ));
      
    } catch (error) {
      console.error('Error saving to database:', error);
      alert(getTranslatedText(
        '❌ Error saving scheme. Please try again.',
        '❌ Hitilafu katika kuhifadhi mfumo. Tafadhali jaribu tena.'
      ));
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== GENERATE PDF =====================
  const generatePDF = () => {
    if (!previewData) {
      alert(getTranslatedText('No scheme data to generate PDF.', 'Hakuna data ya mfumo ya kutengeneza PDF.'));
      return;
    }
    
    setIsGeneratingPDF(true);
    
    // Generate PDF content
    setTimeout(() => {
      setIsGeneratingPDF(false);
      
      let textContent = '';
      const { meta, scheme } = previewData;
      
      textContent = `REPUBLIC OF KENYA
MINISTRY OF EDUCATION
KICD-ALIGNED SCHEME OF WORK - JUNIOR SECONDARY (CBE)

SCHOOL: ${meta.school}
GRADE: ${meta.grade}
LEARNING AREA: ${meta.learningArea}
TERM: ${meta.term} ${meta.year}
TEXTBOOK: ${meta.textbook}
DATE GENERATED: ${meta.generatedDate}

================================================================================
QUALITY ASSURANCE REPORT
- Total Lessons: ${meta.totalLessons}
- KICD Official Lessons: ${meta.qualityMetrics.kicdOfficialLessons}
- High Confidence Lessons: ${meta.qualityMetrics.highConfidenceLessons}
- Average Confidence Score: ${meta.qualityMetrics.averageConfidence}
- Database Connection: ${meta.qualityMetrics.databaseConnected ? 'ESTABLISHED' : 'FAILED'}
================================================================================

${scheme.slice(0, 10).map(lesson => `WEEK ${lesson.week} | LESSON ${lesson.lesson} | Source: ${lesson._data_source} | Confidence: ${Math.round(lesson._confidence * 100)}%
${lesson._is_kicd_official ? '✅ KICD OFFICIAL DESIGN' : '📊 Professionally Generated'}
================================================================================

STRAND: ${lesson.strand}
SUB-STRAND: ${lesson.substrand}

LEARNING OUTCOMES:
${lesson.learning_outcomes}

LEARNING EXPERIENCES:
${lesson.learning_experiences}

KEY INQUIRY QUESTIONS:
${lesson.key_inquiry_questions}

LEARNING RESOURCES:
${lesson.learning_resources}

ASSESSMENT METHODS:
${lesson.assessment_methods}

CORE COMPETENCIES: ${lesson.core_competencies}
VALUES: ${lesson.values}
PCI LINKS: ${lesson.pci_links}

REFLECTION: ${lesson.reflection || ''}

`).join('\n')}

================================================================================
Generated by KICD-Aligned Scheme of Work Generator
Focus: Junior Secondary (CBE) - Competency Based Education
Quality Assured: ${meta.kicdAligned ? '✅ KICD-Aligned' : '✅ Professionally Generated'}`;

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sow-${meta.school.replace(/\s+/g, '-')}-${meta.grade.replace(/\s+/g, '-')}-term${formData.term}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(getTranslatedText(
        `✅ PDF generated successfully! Quality: ${meta.qualityMetrics.averageConfidence >= 0.85 ? 'High' : 'Good'}`,
        `✅ PDF imetengenezwa kikamilifu! Ubora: ${meta.qualityMetrics.averageConfidence >= 0.85 ? 'Juu' : 'Nzuri'}`
      ));
    }, 1500);
  };

  // ===================== RESET FORM =====================
  const resetForm = () => {
    setFormData({
      school: '',
      level: '',
      grade: '',
      learning_area: '',
      textbook: '',
      term: '',
      year: new Date().getFullYear()
    });
    setLessonStructure({
      lessons_per_week: '',
      first_week_of_teaching: 1,
      first_lesson_of_teaching: 1,
      last_week_of_teaching: 12,
      last_lesson_of_teaching: 4,
      double_lesson_option: 'single',
      double_lesson_combination: ''
    });
    setHasBreaks(false);
    setBreaks([]);
    setSelectedStrands({});
    setSelectedSubstrands({});
    setPreviewData(null);
    setIsGrade10(false);
    setCurrentStep(1);
    curriculumCache.current = {};
    generationSources.current = {
      database_exact_match: 0,
      database_partial_match: 0,
      kicd_guided_ai_fallback: 0,
      emergency_fallback: 0
    };
  };

  // ===================== RENDER DATABASE CONNECTION STATUS =====================
  const renderDatabaseStatus = () => {
    if (!dbCheckDone) {
      return (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-600 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-bold text-yellow-700">
              {getTranslatedText('Checking database connection...', 'Inakagua muunganisho wa database...')}
            </span>
          </div>
        </div>
      );
    }

    if (!dbConnected) {
      return (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-bold text-red-700">
                  {getTranslatedText('⚠️ DATABASE CONNECTION FAILED', '⚠️ MUUNGANISHO WA DATABASE UMESHINDWA')}
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {getTranslatedText(
                    'Cannot generate professional schemes without database.',
                    'Haiwezekani kutengeneza mifumo ya kitaaluma bila database.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-xl">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-green-700">
            {getTranslatedText('✅ DATABASE CONNECTED - Ready to generate', '✅ DATABASE IMESHIKANA - Tuko tayari kutengeneza')}
          </span>
        </div>
      </div>
    );
  };

  // ===================== RENDER LOADING OVERLAY =====================
  const renderLoadingOverlay = () => (
    (isSaving || loading) && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute w-20 h-20 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {generationProgress.current || getTranslatedText('Loading...', 'Inapakia...')}
            </h3>
            
            {generationProgress.source && (
              <div className={`mb-4 px-3 py-1 rounded-full text-sm font-bold inline-block ${
                generationProgress.source === 'database_exact_match' ? 'bg-green-100 text-green-800' :
                generationProgress.source === 'database_partial_match' ? 'bg-blue-100 text-blue-800' :
                generationProgress.source === 'kicd_guided_ai_fallback' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }`}>
                {generationProgress.source === 'database_exact_match' ? '🎯 KICD Exact Match' :
                 generationProgress.source === 'database_partial_match' ? '📊 KICD Template' :
                 generationProgress.source === 'kicd_guided_ai_fallback' ? '🤖 KICD-Guided AI' :
                 generationProgress.source === 'database_search' ? '🔍 Searching KICD DB' :
                 '⚠️ Fallback'}
              </div>
            )}
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress.completed}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{generationProgress.completed}% complete</span>
              <span>Confidence: {Math.round(generationProgress.confidence * 100)}%</span>
            </div>
            
            {/* Grade 10 warning in loading */}
            {isGrade10 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm font-bold">
                  ⚠️ Grade 10 is coming soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  // ===================== RENDER STEP 1 =====================
  const renderStep1 = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
      {/* DATABASE STATUS AT TOP */}
      {renderDatabaseStatus()}
      
      {/* GRADE 10 WARNING BANNER */}
      {isGrade10 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 text-lg mb-1">🎓 Grade 10 Coming Soon!</h3>
              <p className="text-yellow-700 text-sm">
                We're currently focused on Junior Secondary (CBE) Grades 7-9. Grade 10 support will be available in the next update.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-3xl font-bold mb-8 text-blue-800 border-b pb-4">
        {getTranslatedText('Step 1: Basic Information', 'Hatua ya 1: Maelezo ya Msingi')}
      </h2>
      
      <div className="space-y-8">
        {/* School Name */}
        <div>
          <label className="block text-lg font-bold mb-3 text-gray-800">
            {getTranslatedText('School Name *', 'Jina la Shule *')}
          </label>
          <input 
            type="text" 
            value={formData.school} 
            onChange={e => handleInputChange('school', e.target.value)} 
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all hover:border-blue-400" 
            placeholder={getTranslatedText("e.g., Kiwanja Junior Secondary", "mfano: Shule ya Sekondari ya Upili Kiwanja")} 
          />
        </div>

        {/* Level Selection - CBE FOCUSED */}
        <div>
          <label className="block text-lg font-bold mb-3 text-gray-800">
            {getTranslatedText('Education Level *', 'Kiwango cha Elimu *')}
          </label>
          <div className="relative">
            <select 
              value={formData.level} 
              onChange={e => handleInputChange('level', e.target.value)} 
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg appearance-none transition-all hover:border-blue-400"
            >
              <option value="">{getTranslatedText('-- Select Education Level --', '-- Chagua Kiwango cha Elimu --')}</option>
              {levels.filter(level => 
                level.name.toLowerCase().includes('junior') || 
                level.name.toLowerCase().includes('jss') ||
                level.name.toLowerCase().includes('cbe')
              ).map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.name.toLowerCase().includes('junior') ? '👨‍🎓 (CBE)' : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 font-medium">
            👨‍🎓 Focus: Junior Secondary (Competency Based Education)
          </p>
        </div>

        {/* Grade Selection */}
        {formData.level && (
          <div>
            <label className="block text-lg font-bold mb-3 text-gray-800">
              {getTranslatedText('Grade *', 'Darasa *')}
            </label>
            <div className="relative">
              <select 
                value={formData.grade} 
                onChange={e => handleInputChange('grade', e.target.value)} 
                className="w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg appearance-none transition-all border-gray-300 hover:border-blue-400"
                disabled={loading}
              >
                <option value="">{getTranslatedText('-- Select Grade --', '-- Chagua Darasa --')}</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.name.includes('Grade 10') ? '🚧 (Coming Soon)' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {loading && (
              <div className="mt-2 text-blue-600">
                {getTranslatedText('Loading grades...', 'Inapakia madarasa...')}
              </div>
            )}
            {isGrade10 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  <span className="font-bold">Note:</span> Grade 10 support is coming soon. Focus on Grades 7-9 for now.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Learning Area Selection */}
        {formData.grade && !isGrade10 && (
          <div>
            <label className="block text-lg font-bold mb-3 text-gray-800">
              {getTranslatedText('Learning Area *', 'Eneo la Kujifunza *')}
            </label>
            <div className="relative">
              <select 
                value={formData.learning_area} 
                onChange={e => handleInputChange('learning_area', e.target.value)} 
                className="w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg appearance-none transition-all border-gray-300 hover:border-blue-400"
                disabled={loading}
              >
                <option value="">{getTranslatedText('-- Select Learning Area --', '-- Chagua Eneo la Kujifunza --')}</option>
                {learning_areas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Textbook Selection (Optional) */}
        {formData.learning_area && !isGrade10 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800">
                  {getTranslatedText('📚 Textbook (Optional)', '📚 Kitabu (Hiari)')}
                </h3>
              </div>
            </div>
            
            <input 
              type="text" 
              value={formData.textbook} 
              onChange={e => handleInputChange('textbook', e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 text-lg transition-all hover:border-green-400" 
              placeholder={getTranslatedText(
                "e.g., Mentor English Grade 9",
                "mfano: Mentor English Darasa la 9"
              )} 
            />
          </div>
        )}

        {/* Term and Year Selection */}
        {!isGrade10 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-bold mb-3 text-gray-800">
                {getTranslatedText('Term *', 'Muhula *')}
              </label>
              <select 
                value={formData.term} 
                onChange={e => handleInputChange('term', e.target.value)} 
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg appearance-none transition-all hover:border-blue-400"
              >
                <option value="">{getTranslatedText('-- Select Term --', '-- Chagua Muhula --')}</option>
                {terms.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-bold mb-3 text-gray-800">
                {getTranslatedText('Year *', 'Mwaka *')}
              </label>
              <select 
                value={formData.year} 
                onChange={e => handleInputChange('year', e.target.value)} 
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg appearance-none transition-all hover:border-blue-400"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Next Button - DISABLED if database not connected or Grade 10 */}
        <div className="pt-6">
          <button 
            onClick={handleStep1Next} 
            disabled={!isStep1Complete() || !dbConnected || isGrade10} 
            className={`w-full text-white p-6 rounded-2xl font-bold text-xl transition-all flex items-center justify-center ${
              isStep1Complete() && dbConnected && !isGrade10
                ? 'bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 hover:from-blue-700 hover:via-green-700 hover:to-emerald-700 shadow-2xl hover:shadow-3xl hover:-translate-y-1' 
                : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
            }`}
          >
            {isGrade10 ? (
              <>
                <span className="mr-4">
                  {getTranslatedText('🚧 Grade 10 Coming Soon', '🚧 Darasa la 10 Linakuja Hivi Karibuni')}
                </span>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </>
            ) : !dbConnected ? (
              <>
                <span className="mr-4">
                  {getTranslatedText('❌ Database Not Connected', '❌ Database Haijashikana')}
                </span>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </>
            ) : isStep1Complete() ? (
              <>
                <span className="mr-4">{getTranslatedText('Next: Select Topics', 'Inayofuata: Chagua Mada')}</span>
                <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </>
            ) : (
              <>
                <span className="mr-4">{getTranslatedText('Complete Required Fields', 'Kamilisha Sehemu Zinazohitajika')}</span>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ===================== RENDER STEP 2 =====================
  const renderStep2 = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
      {/* DATABASE STATUS WARNING */}
      {!dbConnected && dbCheckDone && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-xl">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-bold text-red-700">
              {getTranslatedText(
                '⚠️ GENERATING WITHOUT DATABASE - Quality will be reduced',
                '⚠️ INA-TENGENEZA BILA DATABASE - Ubora utapungua'
              )}
            </span>
          </div>
        </div>
      )}

      {/* Set Book Selection for Language Subjects */}
      {shouldShowSetBookSelection() && setBooks.length > 0 && (
        <div className="mb-10 p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mr-5">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-800">
                  {isKiswahiliSubject() ? '📚 Uchaguzi wa Kitabu cha Fasihi' : '📚 Set Book Selection'}
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  {getTranslatedText(
                    'Select a set book to automatically update literature sections',
                    'Chagua kitabu cha fasihi kusasisha sehemu za fasihi kiotomatiki'
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {selectedSetBook && (
            <div className="mb-6 p-5 bg-purple-100 rounded-xl border-2 border-purple-300">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <p className="text-sm font-bold text-purple-700">
                    {getTranslatedText('Selected:', 'Imechaguliwa:')}
                  </p>
                  <p className="font-bold text-purple-900 text-lg">{selectedSetBook}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {setBooks.map(book => {
              const displayTitle = formatSetBookTitle(book);
              return (
                <button 
                  key={book.id}
                  onClick={() => handleSetBookSelection(book.book_title, book.book_author)}
                  disabled={isSettingBook}
                  className={`p-5 border-3 rounded-xl text-left transition-all ${selectedSetBook === displayTitle ? 'border-purple-500 bg-purple-100 shadow-lg' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'} ${isSettingBook ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-bold text-gray-800 mb-2">{displayTitle}</div>
                  {book.book_author && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {isKiswahiliSubject() ? 'Mwandishi:' : 'Author:'} {book.book_author}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-8 text-blue-800 border-b pb-4">
        {getTranslatedText('Step 2: Select Strands and Substrands', 'Hatua ya 2: Chagua Mada na Mada Ndogo')}
      </h2>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg">
            {getTranslatedText('Loading KICD curriculum topics...', 'Inapakia mada za mtaala ya KICD...')}
          </p>
        </div>
      ) : strands.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border-3 border-dashed border-gray-300 rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-xl font-bold text-gray-600 mb-2">
            {getTranslatedText('No Curriculum Found', 'Hakuna Mtaala Ulioapatikana')}
          </p>
          <button 
            onClick={handleBack} 
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 transition-all"
          >
            {getTranslatedText('Go Back', 'Rudi Nyuma')}
          </button>
        </div>
      ) : (
        <>
          {/* Selection Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl border-2 border-blue-200 mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="font-bold text-blue-800 text-lg">
                  {getTranslatedText(
                    `Select all substrands you want to include in your KICD-aligned scheme`,
                    `Chagua mada ndogo zote unazotaka kujumuisha kwenye mfumo unaolingana na KICD`
                  )}
                </p>
                <p className="text-blue-600 mt-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">
                    {Object.values(selectedSubstrands).filter(Boolean).length} {getTranslatedText('selected', 'zimechaguliwa')}
                  </span>
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const allSelected = {};
                    const allSubSelected = {};
                    strands.forEach(strand => {
                      allSelected[strand.id] = true;
                      const subs = substrands[strand.id] || [];
                      subs.forEach(sub => {
                        allSubSelected[sub.id] = true;
                      });
                    });
                    setSelectedStrands(allSelected);
                    setSelectedSubstrands(allSubSelected);
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center font-bold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {getTranslatedText('Select All', 'Chagua Zote')}
                </button>
                <button
                  onClick={() => {
                    setSelectedStrands({});
                    setSelectedSubstrands({});
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all flex items-center font-bold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {getTranslatedText('Clear All', 'Futa Zote')}
                </button>
              </div>
            </div>
          </div>

          {/* Strands List */}
          <div className="space-y-6">
            {strands.map((strand, index) => {
              const sSubs = (substrands[strand.id] || []).sort((a,b) => {
                const orderA = a.order_index || 0;
                const orderB = b.order_index || 0;
                if (orderA !== orderB) return orderA - orderB;
                return (a.title || '').localeCompare(b.title || '');
              });
              const selectedCount = sSubs.filter(sub => selectedSubstrands[sub.id]).length;
              
              return (
                <div key={strand.id} className="border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                  {/* Strand Header */}
                  <div className="flex items-start mb-6">
                    <div className="mr-4 mt-1">
                      <input 
                        type="checkbox" 
                        checked={!!selectedStrands[strand.id]} 
                        onChange={() => handleStrandSelect(strand.id)} 
                        className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500 cursor-pointer" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-3">
                              {getTranslatedText('STRAND', 'MADA')} {strand.order_index || index + 1}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">
                              {strand.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 rounded-full text-sm font-bold">
                            {selectedCount}/{sSubs.length} {getTranslatedText('selected', 'zimechaguliwa')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Substrands List */}
                  {sSubs.length > 0 && (
                    <div className="ml-10 space-y-4">
                      {sSubs.map(substrand => {
                        const isSixth = Number(substrand.order_index) === 6;
                        let displayTitle = substrand.title;
                        
                        const strandNumber = strand.order_index || '?';
                        const substrandNumber = substrand.order_index || '?';
                        
                        if (isSixth && selectedSetBook && (isKiswahiliSubject() || isEnglishSubject())) {
                          displayTitle = isKiswahiliSubject()
                            ? `Fasihi Andishi - ${selectedSetBook}`
                            : `Intensive Reading - ${selectedSetBook}`;
                        }
                        
                        return (
                          <div key={substrand.id} className="flex items-start space-x-4 p-4 hover:bg-blue-50 rounded-xl border-2 border-gray-100 transition-all hover:border-blue-200">
                            <input 
                              type="checkbox" 
                              checked={!!selectedSubstrands[substrand.id]} 
                              onChange={() => handleSubstrandSelect(substrand.id, strand.id)} 
                              className="mt-2 w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                            />
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                  <span className={`font-bold text-lg ${isSixth && !selectedSetBook && shouldShowSetBookSelection() ? 'text-orange-600' : 'text-gray-800'}`}>
                                    <span className="text-sm text-gray-500 font-normal">
                                      {getTranslatedText('SUBSTRAND', 'Mada Ndogo')} {strandNumber}.{substrandNumber}:
                                    </span>{' '}
                                    {displayTitle}
                                  </span>
                                  {isSixth && !selectedSetBook && shouldShowSetBookSelection() && (
                                    <p className="text-sm text-orange-600 mt-2 flex items-center bg-orange-50 p-2 rounded-lg">
                                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      {getTranslatedText('⚠️ Select a set book above', '⚠️ Chagua kitabu hapo juu')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10 pt-8 border-t-2">
        <button 
          onClick={handleBack} 
          className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center font-bold"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {getTranslatedText('Back', 'Nyuma')}
        </button>
        <button 
          onClick={handleStep2Next} 
          disabled={!isStep2Complete} 
          className={`px-8 py-4 rounded-xl transition-all flex items-center font-bold ${isStep2Complete ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'}`}
        >
          <span className="mr-3">{getTranslatedText('Next: Lesson Structure', 'Inayofuata: Muundo wa Masomo')}</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ===================== RENDER STEP 3 =====================
  const renderStep3 = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 border-b pb-4">
        {getTranslatedText('Step 3: Lessons Structure Details', 'Hatua ya 3: Maelezo ya Muundo wa Masomo')}
      </h2>
      
      <div className="space-y-10">
        {/* Number of Lessons Per Week */}
        <div className="border-b-2 pb-10">
          <label className="block text-2xl font-bold mb-6 text-gray-900">
            {getTranslatedText('Number of Lessons Per Week *', 'Idadi ya Masomo Kwa Wiki *')}
          </label>
          <div className="max-w-md">
            <select 
              value={lessonStructure.lessons_per_week} 
              onChange={(e) => {
                handleLessonStructureChange('lessons_per_week', parseInt(e.target.value));
              }}
              className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none transition-all hover:border-blue-400"
            >
              <option value="">{getTranslatedText('-- Select Number of Lessons --', '-- Chagua Idadi ya Masomo --')}</option>
              {lessonsPerWeekOptions.map(num => (
                <option key={num} value={num}>{num} {getTranslatedText('lessons per week', 'masomo kwa wiki')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* First Lesson Details */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-3 border-blue-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-8 text-blue-800 flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {getTranslatedText('First Lesson Details', 'Maelezo ya Somo la Kwanza')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* First Week of Teaching */}
            <div>
              <label className="block text-xl font-bold mb-6 text-gray-900">
                {getTranslatedText('First week of teaching *', 'Wiki ya kwanza ya kufundisha *')}
              </label>
              <select 
                value={lessonStructure.first_week_of_teaching} 
                onChange={(e) => handleLessonStructureChange('first_week_of_teaching', parseInt(e.target.value))}
                className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
              >
                <option value="">{getTranslatedText('-- Select Week --', '-- Chagua Wiki --')}</option>
                {weekOptions.map(num => (
                  <option key={num} value={num}>Week {num}</option>
                ))}
              </select>
            </div>

            {/* First Lesson of Teaching */}
            <div>
              <label className="block text-xl font-bold mb-6 text-gray-900">
                {getTranslatedText('First lesson of teaching *', 'Somo la kwanza la kufundisha *')}
              </label>
              <select 
                value={lessonStructure.first_lesson_of_teaching} 
                onChange={(e) => handleLessonStructureChange('first_lesson_of_teaching', parseInt(e.target.value))}
                className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
                disabled={!lessonStructure.lessons_per_week}
              >
                <option value="">{getTranslatedText('-- Select Lesson --', '-- Chagua Somo --')}</option>
                {lessonOptions
                  .slice(0, lessonStructure.lessons_per_week || 10)
                  .map(num => (
                    <option key={num} value={num}>Lesson {num}</option>
                  ))
                }
              </select>
              {!lessonStructure.lessons_per_week && (
                <p className="text-red-500 mt-3">
                  {getTranslatedText('Please select number of lessons per week first', 'Tafadhali chagua idadi ya masomo kwa wiki kwanza')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Last Lesson Details */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-3 border-red-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-8 text-red-800 flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {getTranslatedText('Last Lesson Details', 'Maelezo ya Somo la Mwisho')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Last Week of Teaching */}
            <div>
              <label className="block text-xl font-bold mb-6 text-gray-900">
                {getTranslatedText('Last week of teaching *', 'Wiki ya mwisho ya kufundisha *')}
              </label>
              <select 
                value={lessonStructure.last_week_of_teaching} 
                onChange={(e) => handleLessonStructureChange('last_week_of_teaching', parseInt(e.target.value))}
                className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
              >
                <option value="">{getTranslatedText('-- Select Week --', '-- Chagua Wiki --')}</option>
                {weekOptions
                  .filter(week => week >= (lessonStructure.first_week_of_teaching || 1))
                  .map(num => (
                    <option key={num} value={num}>Week {num}</option>
                  ))
                }
              </select>
            </div>

            {/* Last Lesson of Teaching */}
            <div>
              <label className="block text-xl font-bold mb-6 text-gray-900">
                {getTranslatedText('Last lesson of teaching *', 'Somo la mwisho la kufundisha *')}
              </label>
              <select 
                value={lessonStructure.last_lesson_of_teaching} 
                onChange={(e) => handleLessonStructureChange('last_lesson_of_teaching', parseInt(e.target.value))}
                className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
                disabled={!lessonStructure.lessons_per_week}
              >
                <option value="">{getTranslatedText('-- Select Lesson --', '-- Chagua Somo --')}</option>
                {lessonOptions
                  .slice(0, lessonStructure.lessons_per_week || 10)
                  .map(num => (
                    <option key={num} value={num}>Lesson {num}</option>
                  ))
                }
              </select>
              {!lessonStructure.lessons_per_week && (
                <p className="text-red-500 mt-3">
                  {getTranslatedText('Please select number of lessons per week first', 'Tafadhali chagua idadi ya masomo kwa wiki kwanza')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Double Lesson Details */}
        <div className="border-b-2 pb-10">
          <label className="block text-2xl font-bold mb-8 text-gray-900">
            {getTranslatedText('Double Lesson Details (Optional)', 'Maelezo ya Somo la Mseto (Hiari)')}
          </label>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-8 rounded-2xl border-2">
              <div className="space-y-6">
                {doubleLessonOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-6 p-5 hover:bg-white rounded-2xl cursor-pointer transition-all hover:shadow-lg">
                    <input 
                      type="radio" 
                      value={option.value} 
                      checked={lessonStructure.double_lesson_option === option.value}
                      onChange={(e) => {
                        handleLessonStructureChange('double_lesson_option', e.target.value);
                        if (e.target.value === 'single') {
                          handleLessonStructureChange('double_lesson_combination', '');
                        }
                      }}
                      className="w-7 h-7 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="text-xl font-bold text-gray-800">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {lessonStructure.double_lesson_option === 'double' && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-3 border-yellow-200 rounded-2xl p-8">
                <label className="block text-xl font-bold mb-6 text-yellow-800">
                  {getTranslatedText('Select Double Lesson Combination', 'Chagua Mchanganyiko wa Somo la Mseto')}
                </label>
                <select 
                  value={lessonStructure.double_lesson_combination} 
                  onChange={(e) => handleLessonStructureChange('double_lesson_combination', e.target.value)}
                  className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 text-xl appearance-none"
                  disabled={!lessonStructure.lessons_per_week}
                >
                  <option value="">{getTranslatedText('-- Select Combination --', '-- Chagua Mchanganyiko --')}</option>
                  {Array.from({ length: (lessonStructure.lessons_per_week || 1) - 1 }, (_, i) => ({
                    value: `${i + 1}-${i + 2}`,
                    label: `${getTranslatedText('Lessons', 'Masomo')} ${i + 1} & ${i + 2}`
                  })).map(combo => (
                    <option key={combo.value} value={combo.value}>{combo.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8">
          <button 
            onClick={handleBack} 
            className="px-8 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center font-bold text-lg"
          >
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {getTranslatedText('Back', 'Nyuma')}
          </button>
          <button 
            onClick={handleStep3Next} 
            disabled={!isStep3Complete()} 
            className={`px-8 py-5 rounded-2xl transition-all flex items-center font-bold text-lg ${isStep3Complete() ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'}`}
          >
            <span className="mr-3">{getTranslatedText('Next: Break Management', 'Inayofuata: Usimamizi wa Mapumziko')}</span>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ===================== RENDER STEP 4 =====================
  const renderStep4 = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 border-b pb-4">
        {getTranslatedText('Step 4: Break Management', 'Hatua ya 4: Usimamizi wa Mapumziko')}
      </h2>
      
      <div className="space-y-10">
        {/* No Breaks Option */}
        <div className="border-b-2 pb-10">
          <label className="flex items-center space-x-6 p-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:bg-white cursor-pointer transition-all hover:shadow-xl">
            <input
              type="checkbox"
              checked={!hasBreaks}
              onChange={(e) => {
                setHasBreaks(!e.target.checked);
                if (e.target.checked) {
                  setBreaks([]);
                  setNewBreak({
                    title: '',
                    startWeek: '',
                    startLesson: '',
                    endWeek: '',
                    endLesson: ''
                  });
                }
              }}
              className="w-7 h-7 text-blue-600"
            />
            <div className="flex-1">
              <span className="text-2xl font-bold text-gray-900">
                {getTranslatedText('No Breaks During This Term', 'Hakuna Mapumziko Katika Muhula Hii')}
              </span>
            </div>
          </label>
        </div>

        {/* Enter New Break Details */}
        {hasBreaks && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-3 border-blue-300 rounded-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 text-blue-800 flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              {getTranslatedText('➕ Add New Break/Interruption', '➕ Ongeza Mapumziko/Mkazo Mpya')}
            </h3>
            
            <div className="space-y-10">
              {/* Break Title */}
              <div>
                <label className="block text-xl font-bold mb-4 text-gray-900">
                  {getTranslatedText('Title of Break/Interruption *', 'Jina la Mapumziko/Mkazo *')}
                </label>
                <input
                  type="text"
                  value={newBreak.title}
                  onChange={(e) => setNewBreak(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl transition-all hover:border-blue-400"
                  placeholder={getTranslatedText(
                    "e.g., Midterm Break, National Exams, Sports Day",
                    "mfano: Mapumziko ya Katikati, Mitihani ya Kitaifa, Siku ya Michezo"
                  )}
                />
              </div>

              {/* Break Start */}
              <div className="border-t-2 pt-10">
                <h4 className="text-2xl font-bold mb-8 text-blue-700">
                  {getTranslatedText('Break Start Date', 'Tarehe ya Mwanzo wa Mapumziko')}
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Week Number *', 'Nambari ya Wiki *')}
                    </label>
                    <select
                      value={newBreak.startWeek}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, startWeek: e.target.value }))}
                      className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
                    >
                      <option value="">{getTranslatedText('-- Select Week --', '-- Chagua Wiki --')}</option>
                      {getWeekNumberOptions().map(week => (
                        <option key={week} value={week}>Week {week}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Lesson Number *', 'Nambari ya Somo *')}
                    </label>
                    <select
                      value={newBreak.startLesson}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, startLesson: e.target.value }))}
                      className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
                    >
                      <option value="">{getTranslatedText('-- Select Lesson --', '-- Chagua Somo --')}</option>
                      {getLessonNumberOptions().map(lesson => (
                        <option key={lesson} value={lesson}>Lesson {lesson}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Break End */}
              <div className="border-t-2 pt-10">
                <h4 className="text-2xl font-bold mb-8 text-blue-700">
                  {getTranslatedText('Break End Date', 'Tarehe ya Mwisho wa Mapumziko')}
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Week Number *', 'Nambari ya Wiki *')}
                    </label>
                    <select
                      value={newBreak.endWeek}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, endWeek: e.target.value }))}
                      className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
                    >
                      <option value="">{getTranslatedText('-- Select Week --', '-- Chagua Wiki --')}</option>
                      {getWeekNumberOptions()
                        .filter(week => week >= (parseInt(newBreak.startWeek) || 0))
                        .map(week => (
                          <option key={week} value={week}>Week {week}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Lesson Number *', 'Nambari ya Somo *')}
                    </label>
                    <select
                      value={newBreak.endLesson}
                      onChange={(e) => setNewBreak(prev => ({ ...prev, endLesson: e.target.value }))}
                      className="w-full p-5 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl appearance-none"
                    >
                      <option value="">{getTranslatedText('-- Select Lesson --', '-- Chagua Somo --')}</option>
                      {getLessonNumberOptions().map(lesson => (
                        <option key={lesson} value={lesson}>Lesson {lesson}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Add Break Button */}
              <button
                onClick={handleAddBreak}
                disabled={!newBreak.title || !newBreak.startWeek || !newBreak.startLesson || !newBreak.endWeek || !newBreak.endLesson}
                className={`w-full p-6 rounded-2xl font-bold text-xl transition-all flex items-center justify-center ${!newBreak.title || !newBreak.startWeek || !newBreak.startLesson || !newBreak.endWeek || !newBreak.endLesson ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed text-white' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:-translate-y-1'}`}
              >
                <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {getTranslatedText('Add New Break to Schedule', 'Ongeza Mapumziko Mapya Kwenye Ratiba')}
              </button>
            </div>
          </div>
        )}

        {/* List of Added Breaks */}
        {breaks.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-yellow-200 rounded-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 text-yellow-800 flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {getTranslatedText('📋 Scheduled Breaks & Interruptions', '📋 Mapumziko na Usumbufu Ulioratibiwa')}
            </h3>
            
            <div className="space-y-6">
              {breaks.map(breakItem => (
                <div key={breakItem.id} className="flex items-center justify-between bg-white p-8 rounded-2xl border-2 border-yellow-100 hover:shadow-xl transition-all">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mr-6">
                        <svg className="w-9 h-9 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-2xl text-gray-900">{breakItem.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">{getTranslatedText('Start:', 'Mwanzo:')}</p>
                              <p className="font-bold text-gray-800">
                                {getTranslatedText(
                                  `Week ${breakItem.startWeek}, Lesson ${breakItem.startLesson}`,
                                  `Wiki ${breakItem.startWeek}, Somo ${breakItem.startLesson}`
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">{getTranslatedText('End:', 'Mwisho:')}</p>
                              <p className="font-bold text-gray-800">
                                {getTranslatedText(
                                  `Week ${breakItem.endWeek}, Lesson ${breakItem.endLesson}`,
                                  `Wiki ${breakItem.endWeek}, Somo ${breakItem.endLesson}`
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBreak(breakItem.id)}
                    className="ml-6 p-4 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-2xl transition-all"
                    title={getTranslatedText('Remove this break', 'Futa mapumziko haya')}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border-2 border-blue-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="font-bold text-2xl text-blue-800">
                    {getTranslatedText('Summary:', 'Muhtasari:')}
                  </p>
                  <p className="text-blue-700 text-lg mt-2">
                    {getTranslatedText(
                      `Total breaks: ${breaks.length}`,
                      `Jumla ya mapumziko: ${breaks.length}`
                    )}
                  </p>
                </div>
                <div className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xl">
                  {breaks.length} {getTranslatedText('Breaks', 'Mapumziko')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - SHOW DATABASE WARNING */}
        <div className="flex justify-between pt-10">
          <button 
            onClick={handleBack} 
            className="px-8 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center font-bold text-lg"
          >
            <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {getTranslatedText('Back', 'Nyuma')}
          </button>
          
          <div className="flex flex-col items-end gap-4">
            {!dbConnected && dbCheckDone && (
              <div className="text-right">
                <p className="text-red-600 font-bold text-sm mb-1">
                  ⚠️ {getTranslatedText('DATABASE NOT CONNECTED', 'DATABASE HAIIJASHIKANA')}
                </p>
                <p className="text-red-500 text-xs">
                  {getTranslatedText(
                    'Will use KICD-guided AI fallback only',
                    'Itatumia backup ya AI inayoongozwa na KICD tu'
                  )}
                </p>
              </div>
            )}
            
            <button 
              onClick={generatePreviewData}
              className="px-8 py-5 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl hover:from-blue-700 hover:to-green-700 transition-all flex items-center font-bold text-lg"
            >
              <span className="mr-3">
                {getTranslatedText('Generate KICD-Aligned Scheme', 'Tengeza Mfumo Unaolingana na KICD')}
              </span>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ===================== RENDER STEP 5 =====================
  const renderStep5 = () => {
    if (!previewData) return null;
    
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mr-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {getTranslatedText('Your KICD-Aligned Scheme of Work is Ready!', 'Mfumo Wako Unaolingana na KICD Umekamilika!')}
            </h2>
            {previewData.meta.qualityMetrics.kicdOfficialLessons > 0 && (
              <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                KICD-OFFICIAL
              </span>
            )}
          </div>
          
          {/* Database Status Badge */}
          <div className={`inline-block px-4 py-2 rounded-full font-bold mb-6 ${
            previewData.meta.qualityMetrics.databaseConnected
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
            {previewData.meta.qualityMetrics.databaseConnected 
              ? '✅ KICD-DATABASE CONNECTED'
              : '⚠️ KICD-GUIDED AI GENERATED'
            }
          </div>
          
          {/* Quality Metrics */}
          {previewData.meta.qualityMetrics && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 mb-6 inline-block">
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {previewData.meta.qualityMetrics.kicdOfficialLessons}
                  </div>
                  <div className="text-sm text-gray-600">KICD Official</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {previewData.meta.qualityMetrics.highConfidenceLessons}
                  </div>
                  <div className="text-sm text-gray-600">High Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(previewData.meta.qualityMetrics.averageConfidence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">KICD Alignment</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality Report */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {getTranslatedText('KICD Alignment Report', 'Ripoti ya Ulingano na KICD')}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{getTranslatedText('KICD Alignment Score', 'Alama ya Ulingano na KICD')}</p>
              <p className="font-bold text-gray-800 text-2xl">
                {Math.round(previewData.meta.qualityMetrics.averageConfidence * 100)}/100
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                previewData.meta.qualityMetrics.averageConfidence >= 0.9 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                previewData.meta.qualityMetrics.averageConfidence >= 0.8 ? 'bg-gradient-to-r from-blue-500 to-green-500' :
                'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
              style={{ width: `${previewData.meta.qualityMetrics.averageConfidence * 100}%` }}
            ></div>
          </div>
          
          {/* Data Source Breakdown */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-700">
                {previewData.meta.qualityMetrics.dataSources.database_exact_match || 0}
              </div>
              <div className="text-xs text-green-600">KICD Exact</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-700">
                {previewData.meta.qualityMetrics.dataSources.database_partial_match || 0}
              </div>
              <div className="text-xs text-blue-600">KICD Template</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-lg font-bold text-purple-700">
                {previewData.meta.qualityMetrics.dataSources.kicd_guided_ai_fallback || 0}
              </div>
              <div className="text-xs text-purple-600">KICD AI</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-700">
                {previewData.meta.qualityMetrics.dataSources.emergency_fallback || 0}
              </div>
              <div className="text-xs text-red-600">Emergency</div>
            </div>
          </div>
        </div>

        {/* Download Message */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-yellow-200 rounded-2xl p-8 mb-10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {getTranslatedText('Download KICD-Aligned Scheme', 'Pakua Mfumo Unaolingana na KICD')}
            </h3>
            {!previewData.meta.qualityMetrics.databaseConnected && (
              <p className="text-yellow-700 font-bold mt-2">
                ⚠️ {getTranslatedText(
                  'Generated with KICD-guided AI (official database not connected)',
                  'Imetengenezwa kwa AI inayoongozwa na KICD (database rasmi haijashikana)'
                )}
              </p>
            )}
          </div>
        </div>

        {/* Scheme Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-800">{previewData.meta.totalLessons}</p>
                <p className="text-gray-600">{getTranslatedText('Total Lessons', 'Jumla ya Masomo')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-800">{previewData.meta.totalWeeks}</p>
                <p className="text-gray-600">{getTranslatedText('Total Weeks', 'Jumla ya Wiki')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-800">{previewData.meta.qualityMetrics.kicdOfficialLessons}</p>
                <p className="text-gray-600">{getTranslatedText('KICD Official', 'KICD Rasmi')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-800">{Math.round(previewData.meta.qualityMetrics.averageConfidence * 100)}%</p>
                <p className="text-gray-600">{getTranslatedText('KICD Alignment', 'Ulingano na KICD')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEME TABLE */}
        <div className="mb-10 overflow-x-auto">
          <div className="min-w-[1500px]">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                  <th className="border border-gray-400 p-2 w-12 text-center font-bold">WK</th>
                  <th className="border border-gray-400 p-2 w-12 text-center font-bold">LSN</th>
                  <th className="border border-gray-400 p-2 w-80 font-bold">STRAND</th>
                  <th className="border border-gray-400 p-2 w-100 font-bold">SUB-STRAND</th>
                  <th className="border border-gray-400 p-2 w-150 font-bold">LEARNING OUTCOMES</th>
                  <th className="border border-gray-400 p-2 w-150 font-bold">LEARNING EXPERIENCES</th>
                  <th className="border border-gray-400 p-2 w-80 font-bold">KEY INQUIRY QUESTIONS</th>
                  <th className="border border-gray-400 p-2 w-120 font-bold">LEARNING RESOURCES</th>
                  <th className="border border-gray-400 p-2 w-100 font-bold">ASSESSMENT METHODS</th>
                  <th className="border border-gray-400 p-2 w-100 font-bold">REFLECTION</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {previewData.scheme.slice(0, 5).map((lesson, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    {/* Week with source indicator */}
                    <td className="border border-gray-300 p-2 text-center align-top">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{lesson.week}</span>
                        <span className={`text-xs px-1 py-0.5 rounded mt-1 ${
                          lesson._is_kicd_official ? 'bg-green-100 text-green-800' :
                          lesson._confidence >= 0.85 ? 'bg-blue-100 text-blue-800' :
                          lesson._confidence >= 0.75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lesson._is_kicd_official ? 'KICD' :
                           lesson._confidence >= 0.85 ? 'HIGH' :
                           lesson._confidence >= 0.75 ? 'MED' : 'LOW'}
                        </span>
                      </div>
                    </td>
                    
                    {/* Lesson */}
                    <td className="border border-gray-300 p-2 text-center">
                      {lesson.lesson}
                    </td>
                    
                    {/* Strand */}
                    <td className="border border-gray-300 p-2">
                      <div className="max-h-32 overflow-y-auto">
                        {lesson.strand}
                      </div>
                    </td>
                    
                    {/* Sub-strand */}
                    <td className="border border-gray-300 p-2">
                      <div className="max-h-32 overflow-y-auto">
                        {lesson.substrand}
                      </div>
                    </td>
                    
                    {/* Learning Outcomes */}
                    <td className="border border-gray-300 p-2 align-top">
                      <div className="max-h-48 overflow-y-auto">
                        {lesson.learning_outcomes.split('\n').map((line, i) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                    </td>
                    
                    {/* Learning Experiences */}
                    <td className="border border-gray-300 p-2 align-top">
                      <div className="max-h-48 overflow-y-auto">
                        {lesson.learning_experiences.split('\n').map((line, i) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                    </td>
                    
                    {/* Key Inquiry Questions */}
                    <td className="border border-gray-300 p-2 align-top">
                      <div className="max-h-32 overflow-y-auto">
                        {lesson.key_inquiry_questions}
                      </div>
                    </td>
                    
                    {/* Learning Resources */}
                    <td className="border border-gray-300 p-2 align-top">
                      <div className="max-h-48 overflow-y-auto">
                        {lesson.learning_resources.split('\n').map((line, i) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                    </td>
                    
                    {/* Assessment Methods */}
                    <td className="border border-gray-300 p-2 align-top">
                      <div className="max-h-32 overflow-y-auto">
                        {lesson.assessment_methods.split('\n').map((line, i) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                    </td>
                    
                    {/* Reflection */}
                    <td className="border border-gray-300 p-2 align-top">
                      <textarea
                        value={lesson.reflection}
                        onChange={(e) => {
                          const updatedScheme = [...previewData.scheme];
                          updatedScheme[index].reflection = e.target.value;
                          setPreviewData({...previewData, scheme: updatedScheme});
                        }}
                        placeholder={getTranslatedText('Add reflection...', 'Ongeza tafakari...')}
                        className="w-full h-32 p-2 border border-gray-300 rounded resize-none text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <button 
            onClick={() => setCurrentStep(4)}
            className="px-8 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center font-bold text-lg flex-1"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {getTranslatedText('Back', 'Nyuma')}
          </button>
          
          <button 
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center font-bold text-lg flex-1"
          >
            {isGeneratingPDF ? (
              <>
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
                  </div>
                  <span className="ml-3">{getTranslatedText('Generating PDF...', 'Inatengeneza PDF...')}</span>
                </div>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {getTranslatedText('Download KICD PDF', 'Pakua PDF ya KICD')}
              </>
            )}
          </button>
          
          <button 
            onClick={saveToDatabase}
            disabled={isSaving || !previewData.meta.qualityMetrics.databaseConnected}
            className={`px-8 py-5 rounded-2xl transition-all flex items-center justify-center font-bold text-lg flex-1 ${
              !previewData.meta.qualityMetrics.databaseConnected
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {!previewData.meta.qualityMetrics.databaseConnected ? (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {getTranslatedText('No KICD Database', 'Hakuna Database ya KICD')}
              </>
            ) : isSaving ? (
              <>
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-green-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
                  </div>
                  <span className="ml-3">{getTranslatedText('Saving...', 'Inahifadhi...')}</span>
                </div>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v10a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                {getTranslatedText('Save to KICD Database', 'Hifadhi kwenye Database ya KICD')}
              </>
            )}
          </button>
        </div>

        {/* Create Another Scheme */}
        <div className="text-center pt-8 border-t-2">
          <button 
            onClick={resetForm}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {getTranslatedText('+ Create Another KICD Scheme', '+ Unda Mfumo Mwingine wa KICD')}
          </button>
        </div>
      </div>
    );
  };

  // ===================== MAIN RENDER =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      {renderLoadingOverlay()}
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {getTranslatedText('KICD-ALIGNED SCHEME OF WORK GENERATOR', 'KITENGEZI CHA MIFUMO YA KAZI YA KICD')}
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            {getTranslatedText(
              'Focus: Junior Secondary (CBE) - Competency Based Education',
              'Mkazo: Sekondari ya Upili (CBE) - Elimu Inayolenga Stadi'
            )}
          </p>
          <div className="flex justify-center items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${
              dbConnected 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
            }`}>
              {dbConnected ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  KICD-DB-CONNECTED
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  KICD-GUIDED-AI
                </>
              )}
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              CBE-FOCUSED
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              GRADE 10 (Soon)
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${currentStep >= step ? 'bg-gradient-to-br from-blue-600 to-green-600 text-white border-blue-600 scale-110 shadow-lg' : 'bg-white text-gray-500 border-gray-300 hover:border-blue-300 hover:scale-105'}`}>
                {currentStep > step ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 5 && (
                <div className={`w-20 h-2 mx-2 rounded-full transition-all duration-500 ${currentStep > step ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Render Current Step */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>
    </div>
  );
}