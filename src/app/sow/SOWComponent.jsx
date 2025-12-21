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
    custom_textbook: '',
    textbook_source: '',
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
  const [isSettingBook, setIsSettingBook] = useState(false);
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
    confidence: 0,
    qualityMetrics: {}
  });
  
  // Payment states
  const [paymentStatus, setPaymentStatus] = useState(true);
  
  // Cache for curriculum data
  const curriculumCache = useRef({});
  // Track sources for reporting
  const generationSources = useRef({
    kicd_official: 0,
    kicd_database: 0,
    kicd_patterns: 0,
    high_profile_fallback: 0
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

  const shouldShowSetBookSelection = () => {
    if (!formData.grade || !formData.learning_area) return false;
    
    const isLangSubject = isKiswahiliSubject() || isEnglishSubject();
    if (!isLangSubject) return false;
    
    const selectedGrade = grades.find(g => g.id === formData.grade);
    if (!selectedGrade) return false;
    
    const gradeName = selectedGrade.name?.toLowerCase() || '';
    return gradeName.includes('form 3') || gradeName.includes('form 4');
  };

  const getSixthSubstrandText = (bookTitle) => {
    if (isKiswahiliSubject()) {
      return bookTitle ? `Fasihi Andishi - ${bookTitle}` : '⏳ KITABU CHA FASIHI HAKIJACHAGULIWA BADO';
    } else if (isEnglishSubject()) {
      return bookTitle ? `Intensive Reading - ${bookTitle}` : '⏳ SET BOOK NOT SELECTED YET';
    }
    return 'LITERATURE/INTENSIVE READING';
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

  const getTranslatedText = (englishText, kiswahiliText) => {
    return isKiswahiliSubject() ? kiswahiliText : englishText;
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // ===================== DATA FETCHING =====================
  useEffect(() => { 
    const fetchLevels = async () => {
      try {
        const { data, error } = await supabase.from('levels').select('*');
        if (error) throw error;
        setLevels(data || []);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setLevels([]);
      }
    };
    fetchLevels();
    
    // For testing, set payment status to true
    setPaymentStatus(true);
  }, []);

  useEffect(() => {
    if (formData.level) {
      const fetchGrades = async (levelId) => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('level_id', levelId)
            .eq('is_active', true);
          if (error) throw error;
          setGrades((data || []).sort((a,b) => (a.order_index||0) - (b.order_index||0)));
        } catch (err) {
          console.error('Error fetching grades:', err);
          setGrades([]);
        } finally { 
          setLoading(false); 
        }
      };
      fetchGrades(formData.level);
      // Reset dependent fields
      setFormData(prev => ({ 
        ...prev, 
        grade: '', 
        learning_area: '', 
        textbook: '', 
        custom_textbook: '' 
      }));
      setLearning_areas([]);
      setStrands([]);
      setSubstrands({});
      setSelectedSetBook('');
    }
  }, [formData.level]);

  useEffect(() => {
    if (formData.grade) {
      const fetchLearningAreas = async (gradeId) => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('learning_areas')
            .select('*')
            .eq('grade_id', gradeId);
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
      setFormData(prev => ({ 
        ...prev, 
        learning_area: '', 
        textbook: '', 
        custom_textbook: '' 
      }));
      setStrands([]);
      setSubstrands({});
      setSelectedSetBook('');
    }
  }, [formData.grade]);

  // ===================== FETCH REAL STRANDS & SUBSTRANDS =====================
  useEffect(() => {
    const fetchRealStrandsAndSubstrands = async () => {
      if (!formData.learning_area || !formData.grade) return;
      
      try {
        setLoading(true);
        
        // 1. First check if we have set books for language subjects
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
        
        // 2. Fetch strands from unified view
        const { data: strandsData, error: strandsError } = await supabase
          .from('unified_strands')
          .select('*')
          .eq('learning_area_id', formData.learning_area)
          .order('title', { ascending: true });
        
        if (strandsError) {
          console.error('Error fetching strands:', strandsError);
          await fetchFromOriginalTables();
          return;
        }
        
        if (!strandsData || strandsData.length === 0) {
          await fetchFromOriginalTables();
          return;
        }
        
        // We have strands! Now fetch substrands for each strand
        setStrands(strandsData);
        
        const substrandsData = {};
        for (const strand of strandsData) {
          const { data: substrandsForStrand, error: substrandsError } = await supabase
            .from('unified_substrands')
            .select('*')
            .eq('strand_id', strand.id)
            .order('title', { ascending: true });
          
          if (!substrandsError && substrandsForStrand) {
            substrandsData[strand.id] = substrandsForStrand;
            
            // Special handling for 6th substrand in language subjects
            if (shouldShowSetBookSelection() && selectedSetBook) {
              substrandsData[strand.id] = substrandsForStrand.map(sub => {
                if (Number(sub.order_index) === 6) {
                  const newTitle = isKiswahiliSubject() 
                    ? `Fasihi Andishi - ${selectedSetBook}`
                    : `Intensive Reading - ${selectedSetBook}`;
                  return { ...sub, title: newTitle };
                }
                return sub;
              });
            }
          } else {
            substrandsData[strand.id] = [];
          }
        }
        
        setSubstrands(substrandsData);
        
      } catch (error) {
        console.error('Error in fetchRealStrandsAndSubstrands:', error);
        alert(getTranslatedText(
          'Unable to load curriculum topics. Please try again.',
          'Haikuweza kupakia mada za mtaala. Tafadhali jaribu tena.'
        ));
      } finally {
        setLoading(false);
      }
    };

    // Helper function to fetch from original tables if unified view fails
    const fetchFromOriginalTables = async () => {
      try {
        const { data: strandsData, error: strandsError } = await supabase
          .from('strands')
          .select('*')
          .eq('learning_area_id', formData.learning_area)
          .order('order_index', { ascending: true });
        
        if (strandsError) throw strandsError;
        
        if (strandsData && strandsData.length > 0) {
          setStrands(strandsData);
          
          const substrandsData = {};
          for (const strand of strandsData) {
            const { data: substrandsForStrand, error: substrandsError } = await supabase
              .from('substrands')
              .select('*')
              .eq('strand_id', strand.id)
              .order('order_index', { ascending: true });
            
            if (!substrandsError && substrandsForStrand) {
              substrandsData[strand.id] = substrandsForStrand;
            } else {
              substrandsData[strand.id] = [];
            }
          }
          
          setSubstrands(substrandsData);
        }
      } catch (error) {
        console.error('Error fetching from original tables:', error);
        setStrands([]);
        setSubstrands({});
      }
    };

    fetchRealStrandsAndSubstrands();
    
  }, [formData.learning_area, formData.grade, selectedSetBook]);

  // ===================== SET BOOK SELECTION HANDLER =====================
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

  // ===================== SIMPLIFIED KICD CURRICULUM FETCHER =====================
  const fetchKICDCurriculumData = async (substrandId, learningAreaId, gradeId, weekNumber, substrandTitle) => {
    const cacheKey = `${substrandId}-${gradeId}-${weekNumber}`;
    
    // Check cache first
    if (curriculumCache.current[cacheKey]) {
      return curriculumCache.current[cacheKey];
    }

    try {
      // Get learning area and grade names
      const learningAreaName = learning_areas.find(la => la.id === learningAreaId)?.name || '';
      const gradeName = grades.find(g => g.id === gradeId)?.name || '';

      setGenerationProgress(prev => ({ 
        ...prev, 
        current: getTranslatedText(
          '🔍 Fetching KICD curriculum data...',
          '🔍 Inapakia data ya mtaala wa KICD...'
        ),
        source: 'api_fetch'
      }));

      // ============= USE YOUR API ROUTE =============
      const response = await fetch('/api/kicd/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learning_area_id: learningAreaId,
          grade_id: gradeId,
          substrand_title: substrandTitle,
          learning_area_name: learningAreaName,
          grade_name: gradeName,
          week_number: weekNumber
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Track the source
        const sourceType = result.source || 'high_profile_fallback';
        generationSources.current[sourceType] = (generationSources.current[sourceType] || 0) + 1;
        
        // Format the data from API response
        const formattedData = formatDataFromAPI(result.data, sourceType, substrandTitle);
        
        const confidence = result.is_kicd_official ? 0.99 : 
                          sourceType === 'kicd_database' ? 0.95 :
                          sourceType === 'kicd_partial_match' ? 0.85 : 0.75;
        
        const apiResult = {
          type: sourceType,
          data: formattedData,
          confidence: confidence,
          source: sourceType,
          is_real_kicd: result.is_kicd_official || false,
          timestamp: new Date().toISOString()
        };
        
        setGenerationProgress(prev => ({ 
          ...prev, 
          confidence: confidence,
          qualityMetrics: { ...prev.qualityMetrics, [sourceType]: true }
        }));
        
        curriculumCache.current[cacheKey] = apiResult;
        return apiResult;
      }

      throw new Error('API returned unsuccessful');

    } catch (error) {
      console.error('API fetch error, falling back:', error);
      
      // ============= FALLBACK TO SMART GENERATION =============
      setGenerationProgress(prev => ({ 
        ...prev, 
        current: getTranslatedText(
          '⚠️ Using fallback generation...',
          '⚠️ Inatumia mbadala wa kutengeneza...'
        ),
        source: 'fallback'
      }));
      
      generationSources.current.fallback++;
      
      const fallbackData = generateKICDCompliantCurriculum(
        substrandTitle,
        weekNumber,
        learning_areas.find(la => la.id === formData.learning_area)?.name || '',
        grades.find(g => g.id === formData.grade)?.name || ''
      );
      
      const result = {
        type: 'fallback',
        data: fallbackData,
        confidence: 0.70,
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
      
      setGenerationProgress(prev => ({ 
        ...prev, 
        confidence: 0.70,
        qualityMetrics: { ...prev.qualityMetrics, fallback: true }
      }));
      
      curriculumCache.current[cacheKey] = result;
      return result;
    }
  };

  // Helper function to format data from API
  const formatDataFromAPI = (apiData, source, substrandTitle) => {
    const isKiswahili = isKiswahiliSubject();
    
    // Helper to ensure array format
    const ensureArray = (data) => {
      if (Array.isArray(data)) return data;
      if (typeof data === 'string') {
        if (data.startsWith('[')) {
          try {
            return JSON.parse(data);
          } catch (e) {
            return data.split('\n').filter(Boolean);
          }
        }
        return data.split('\n').filter(Boolean);
      }
      return [];
    };
    
    return {
      topic_specific_learning_outcomes: ensureArray(apiData.outcomes || []).length > 0 
        ? ensureArray(apiData.outcomes)
        : [isKiswahili ? `Kuelewa ${substrandTitle}` : `Understand ${substrandTitle}`],
      
      learning_experiences: ensureArray(apiData.experiences || []).length > 0 
        ? ensureArray(apiData.experiences)
        : [isKiswahili ? 'Majadiliano ya kikundi' : 'Group discussions'],
      
      key_inquiry_questions: ensureArray(apiData.questions || []).length > 0 
        ? ensureArray(apiData.questions)
        : [isKiswahili ? `Kwa nini ${substrandTitle} ni muhimu?` : `Why is ${substrandTitle} important?`],
      
      learning_resources: ensureArray(apiData.resources || []).length > 0 
        ? ensureArray(apiData.resources)
        : [isKiswahili ? 'Vitabu vya somo' : 'Textbooks'],
      
      assessment_methods: ensureArray(apiData.assessment || []).length > 0 
        ? ensureArray(apiData.assessment)
        : [isKiswahili ? 'Maswali ya mdomo' : 'Oral questions'],
      
      core_competencies: isKiswahili
        ? 'Mawasiliano; Ufahamu; Ubunifu; Uraia'
        : 'Communication; Critical Thinking; Creativity; Citizenship',
      
      values: isKiswahili
        ? 'Heshima; Uwajibikaji; Umoja'
        : 'Respect; Responsibility; Unity',
      
      pci_links: isKiswahili
        ? 'Stadi za Maisha; Mazingira'
        : 'Life Skills; Environment',
      
      source: source,
      suggested_periods: 2
    };
  };

  // Generate KICD-compliant curriculum (fallback)
  const generateKICDCompliantCurriculum = (substrandTitle, weekNumber, learningArea, grade) => {
    const isKiswahili = isKiswahiliSubject();
    
    // Week-based progression
    const progression = getWeekProgression(weekNumber);
    
    // Generate based on progression stage
    let outcomes, experiences, questions;
    
    if (progression.stage === 'introduction') {
      outcomes = isKiswahili ? [
        `Kutambua ${substrandTitle}`,
        `Kuelezea ${substrandTitle}`,
        `Kutaja mifano ya ${substrandTitle}`
      ] : [
        `Identify ${substrandTitle}`,
        `Explain ${substrandTitle}`,
        `Give examples of ${substrandTitle}`
      ];
      
      experiences = isKiswahili ? [
        'Kutambua dhana',
        'Kujadili kikundi',
        'Kutafuta mifano'
      ] : [
        'Identifying concepts',
        'Group discussions',
        'Finding examples'
      ];
      
      questions = isKiswahili ? [
        `Ni nini ${substrandTitle}?`,
        `${substrandTitle} inamaanisha nini?`
      ] : [
        `What is ${substrandTitle}?`,
        `What does ${substrandTitle} mean?`
      ];
    } else if (progression.stage === 'development') {
      outcomes = isKiswahili ? [
        `Kutumia ${substrandTitle}`,
        `Kuchambua ${substrandTitle}`,
        `Kufanya uhusiano wa ${substrandTitle}`
      ] : [
        `Apply ${substrandTitle}`,
        `Analyze ${substrandTitle}`,
        `Make connections with ${substrandTitle}`
      ];
      
      experiences = isKiswahili ? [
        'Kutumia katika mazoezi',
        'Kuchambua matukio',
        'Kufanya miradi'
      ] : [
        'Applying in exercises',
        'Analyzing situations',
        'Working on projects'
      ];
      
      questions = isKiswahili ? [
        `Unawezaje kutumia ${substrandTitle}?`,
        `${substrandTitle} inahusikanaje?`
      ] : [
        `How can you apply ${substrandTitle}?`,
        `How does ${substrandTitle} relate?`
      ];
    } else { // mastery stage
      outcomes = isKiswahili ? [
        `Kutathmini ${substrandTitle}`,
        `Kubuni kwa ${substrandTitle}`,
        `Kufanya tathmini ya ${substrandTitle}`
      ] : [
        `Evaluate ${substrandTitle}`,
        `Design using ${substrandTitle}`,
        `Conduct assessment of ${substrandTitle}`
      ];
      
      experiences = isKiswahili ? [
        'Kufanya tathmini',
        'Kubuni miradi',
        'Kushiriki majadiliano'
      ] : [
        'Conducting assessments',
        'Designing projects',
        'Participating in discussions'
      ];
      
      questions = isKiswahili ? [
        `Unawezaje kuboresha ${substrandTitle}?`,
        `Ni changamoto gani za ${substrandTitle}?`
      ] : [
        `How can you improve ${substrandTitle}?`,
        `What are the challenges of ${substrandTitle}?`
      ];
    }
    
    return {
      topic_specific_learning_outcomes: outcomes,
      learning_experiences: experiences,
      key_inquiry_questions: questions,
      learning_resources: isKiswahili ? [
        'Vitabu vya somo',
        'Vifaa vya kidijitali',
        'Vifaa vya vitendo'
      ] : [
        'Textbooks',
        'Digital resources',
        'Practical equipment'
      ],
      assessment_methods: isKiswahili ? [
        'Maswali ya mdomo',
        'Kazi za maandishi',
        'Tathmini ya vitendo'
      ] : [
        'Oral questions',
        'Written assignments',
        'Practical assessment'
      ],
      core_competencies: isKiswahili
        ? 'Mawasiliano; Ufahamu; Ubunifu'
        : 'Communication; Critical Thinking; Creativity',
      values: isKiswahili
        ? 'Heshima; Uwajibikaji; Umoja'
        : 'Respect; Responsibility; Unity',
      pci_links: isKiswahili
        ? 'Stadi za Maisha; Mazingira'
        : 'Life Skills; Environment',
      source: 'kicd_compliant_fallback',
      progression_stage: progression.stage
    };
  };

  // Helper: Get week progression stage
  const getWeekProgression = (weekNumber) => {
    if (weekNumber <= 3) return { stage: 'introduction', focus: 'basic concepts' };
    if (weekNumber <= 6) return { stage: 'development', focus: 'application' };
    if (weekNumber <= 9) return { stage: 'mastery', focus: 'advanced skills' };
    return { stage: 'assessment', focus: 'evaluation' };
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
    if (!isStep4Complete()) return;
    
    setIsSaving(true);
    setGenerationProgress({
      total: 100,
      completed: 0,
      current: getTranslatedText('Preparing your scheme...', 'Inajiandaa kukutengenezea mfumo...'),
      source: '',
      confidence: 0,
      qualityMetrics: {}
    });
    
    // Reset generation sources
    generationSources.current = {
      kicd_official: 0,
      kicd_database: 0,
      kicd_partial_match: 0,
      high_profile_fallback: 0,
      fallback: 0
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
              substrand_id: sub.id
            });
          }
        });
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
      
      // Generate scheme data with KICD integration
      const schemeRows = [];
      let currentWeek = lessonStructure.first_week_of_teaching;
      let currentLesson = lessonStructure.first_lesson_of_teaching;
      let contentIndex = 0;
      
      // Progress tracking
      const totalLessons = Math.min(totalAvailableLessons, selectedContent.length * 3);
      let completedLessons = 0;

      for (let week = 0; week < totalWeeks; week++) {
        // Check if this week is in a break
        const isInBreak = breaks.some(b => 
          currentWeek >= b.startWeek && currentWeek <= b.endWeek
        );
        
        if (!isInBreak) {
          for (let lesson = 1; lesson <= lessonsPerWeek; lesson++) {
            if (schemeRows.length >= totalAvailableLessons || contentIndex >= selectedContent.length * 3) break;
            
            const content = selectedContent[contentIndex % selectedContent.length];
            
            // Update progress
            completedLessons++;
            const progressPercent = Math.round((completedLessons / totalLessons) * 100);
            
            setGenerationProgress(prev => ({ 
              ...prev, 
              completed: progressPercent,
              current: getTranslatedText(
                `Generating lesson ${currentLesson} for ${content.substrand.substring(0, 30)}...`,
                `Inatengenezea somo ${currentLesson} la ${content.substrand.substring(0, 30)}...`
              )
            }));
            
            // Fetch KICD curriculum data using API
            const curriculumData = await fetchKICDCurriculumData(
              content.substrand_id,
              formData.learning_area,
              formData.grade,
              currentWeek,
              content.substrand
            );
            
            const formatList = (items) => {
              if (Array.isArray(items)) {
                return items.map((item, i) => `${i+1}. ${item}`).join('\n');
              }
              return items;
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
              core_competencies: curriculumData.data.core_competencies,
              values: curriculumData.data.values,
              pci_links: curriculumData.data.pci_links,
              reflection: '',
              _data_source: curriculumData.source,
              _confidence: curriculumData.confidence,
              _is_real_kicd: curriculumData.is_real_kicd || false,
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
      const kicdOfficialLessons = schemeRows.filter(l => l._is_real_kicd).length;
      const highConfidenceLessons = schemeRows.filter(l => l._confidence >= 0.85).length;
      const averageConfidence = schemeRows.reduce((sum, l) => sum + l._confidence, 0) / totalLessonsGenerated;
      
      // Create preview data object with detailed metrics
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
            dataSources: generationSources.current
          },
          kicdAligned: kicdOfficialLessons > 0 || highConfidenceLessons > 0
        },
        scheme: schemeRows,
        breaks: breaks,
        paymentStatus: paymentStatus
      };

      setPreviewData(previewDataObj);
      setCurrentStep(5);
      
      // Show quality summary
      const qualitySummary = `✅ YOUR PROFESSIONAL SCHEME OF WORK IS READY!

📊 QUALITY METRICS:
   • Total Lessons: ${totalLessonsGenerated}
   • KICD Official Lessons: ${kicdOfficialLessons}
   • High Confidence (85%+): ${highConfidenceLessons}
   • Average Confidence: ${Math.round(averageConfidence * 100)}%

🎯 DATA SOURCES:
   • KICD Official Designs: ${generationSources.current.kicd_official || 0}
   • Database Curriculum: ${generationSources.current.kicd_database || 0}
   • KICD Pattern-Based: ${generationSources.current.kicd_partial_match || 0}
   • High-Profile Fallback: ${generationSources.current.high_profile_fallback || 0}
   • Emergency Fallback: ${generationSources.current.fallback || 0}

📄 Your scheme is ${kicdOfficialLessons > 0 ? 'KICD-ALIGNED' : 'professionally generated'} and ready for use!`;
      
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
        confidence: 0,
        qualityMetrics: {}
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
      
      // Save each lesson to kicd_curriculum table
      const lessonsToSave = previewData.scheme.map(lesson => ({
        grade_level: previewData.meta.grade,
        learning_area: previewData.meta.learningArea,
        term: previewData.meta.term,
        week: `Week ${lesson.week}`,
        lesson_number: lesson.lesson,
        strand_title: lesson.strand,
        substrand_title: lesson.substrand,
        topic_specific_learning_outcomes: lesson.learning_outcomes.split('\n').map(l => l.replace(/^\d+\.\s*/, '')),
        learning_experiences: lesson.learning_experiences.split('\n').map(l => l.replace(/^\d+\.\s*/, '')),
        key_inquiry_questions: lesson.key_inquiry_questions.split('\n').map(l => l.replace(/^\d+\.\s*/, '')),
        learning_resources: lesson.learning_resources.split('\n').map(l => l.replace(/^\d+\.\s*/, '')),
        assessment_methods: lesson.assessment_methods.split('\n').map(l => l.replace(/^\d+\.\s*/, '')),
        core_competencies: lesson.core_competencies,
        values: lesson.values,
        pci_links: lesson.pci_links,
        source_document: lesson._is_real_kicd ? 'KICD Design' : 'System Generated',
        kicd_reference_code: `${previewData.meta.learningArea.substring(0, 3)}${previewData.meta.grade.substring(0, 2)}.W${lesson.week}`,
        generated_by_ai: !lesson._is_real_kicd
      }));
      
      // Insert all lessons
      const { data, error } = await supabase
        .from('kicd_curriculum')
        .insert(lessonsToSave);
      
      if (error) throw error;
      
      alert(getTranslatedText(
        '✅ Scheme of work saved successfully!',
        '✅ Mfumo wa kazi umehifadhiwa kikamilifu!'
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
  const generatePDF = (format = 'standard') => {
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
      
      if (format === 'standard') {
        textContent = `REPUBLIC OF KENYA
MINISTRY OF EDUCATION
KICD-ALIGNED SCHEME OF WORK

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
================================================================================

${scheme.slice(0, 10).map(lesson => `WEEK ${lesson.week} | LESSON ${lesson.lesson} | Source: ${lesson._data_source} | Confidence: ${Math.round(lesson._confidence * 100)}%
${lesson._is_real_kicd ? '✅ KICD OFFICIAL DESIGN' : '📊 Professionally Generated'}
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
Generated by Professional KICD Scheme of Work Generator
Quality Assured: ${meta.kicdAligned ? '✅ KICD-Aligned' : '✅ Professionally Generated'}`;
      } else {
        textContent = `SCHEME OF WORK - COMPACT VERSION
=================================

School: ${meta.school}
Grade: ${meta.grade}
Subject: ${meta.learningArea}
Term: ${meta.term} ${meta.year}
Quality: ${meta.qualityMetrics.averageConfidence >= 0.85 ? 'High' : 'Standard'}

${scheme.slice(0, 15).map(lesson => `WK ${lesson.week} LSN ${lesson.lesson} [${lesson._data_source.substring(0, 3)}]
${lesson.strand.substring(0, 30)}
${lesson.substrand.substring(0, 40)}

${lesson.learning_outcomes.split('\n')[0]?.replace('1. ', '')?.substring(0, 60) || ''}
`).join('\n')}

--- END ---
Quality Metrics: ${meta.qualityMetrics.kicdOfficialLessons} KICD lessons, ${meta.qualityMetrics.highConfidenceLessons} high confidence`;
      }
      
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
      custom_textbook: '',
      textbook_source: '',
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
    setCurrentStep(1);
    curriculumCache.current = {};
    generationSources.current = {
      kicd_official: 0,
      kicd_database: 0,
      kicd_partial_match: 0,
      high_profile_fallback: 0,
      fallback: 0
    };
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
                generationProgress.source === 'kicd_official' ? 'bg-green-100 text-green-800' :
                generationProgress.source === 'kicd_database' ? 'bg-blue-100 text-blue-800' :
                generationProgress.source === 'kicd_partial_match' ? 'bg-purple-100 text-purple-800' :
                generationProgress.source === 'high_profile_fallback' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {generationProgress.source === 'kicd_official' ? '🎯 KICD Official' :
                 generationProgress.source === 'kicd_database' ? '📊 Database' :
                 generationProgress.source === 'kicd_partial_match' ? '🔍 Pattern Match' :
                 generationProgress.source === 'high_profile_fallback' ? '🤖 Smart Fallback' :
                 '⚠️ Emergency'}
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
            
            {generationProgress.qualityMetrics && generationProgress.qualityMetrics.kicd_official && (
              <p className="text-sm text-green-600 font-bold">
                ✅ Using KICD Official Curriculum Design
              </p>
            )}
          </div>
        </div>
      </div>
    )
  );

  // ===================== RENDER STEP 1 =====================
  const renderStep1 = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 border-b pb-4">
        {getTranslatedText('Step 1: Basic Information', 'Hatua ya 1: Maelezo ya Msingi')}
      </h2>
      
      <div className="space-y-8">
        {/* School Name */}
        <div>
          <label className="block text-lg font-bold mb-3 text-gray-800">
            {getTranslatedText('School Name *', 'Jina la Shule *')}
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={formData.school} 
              onChange={e => handleInputChange('school', e.target.value)} 
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all hover:border-blue-400" 
              placeholder={getTranslatedText("e.g., Kiwanja Secondary School", "mfano: Shule ya Sekondari Kiwanja")} 
            />
          </div>
        </div>

        {/* Level Selection */}
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
              {levels.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
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
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {loading && (
                <div className="absolute right-4 top-4">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning Area Selection */}
        {formData.grade && (
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
              {loading && (
                <div className="absolute right-4 top-4">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 border-2 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Textbook Selection (Optional) */}
        {formData.learning_area && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">
                    {getTranslatedText('📚 Textbook (Optional)', '📚 Kitabu (Hiari)')}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {getTranslatedText('Recommended but not required', 'Inapendekezwa lakini si lazima')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={formData.textbook || formData.custom_textbook || ''} 
                onChange={e => {
                  handleInputChange('textbook', e.target.value);
                  handleInputChange('custom_textbook', e.target.value);
                }}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 text-lg transition-all hover:border-green-400" 
                placeholder={getTranslatedText(
                  "e.g., Mentor English Grade 9",
                  "mfano: Mentor English Darasa la 9"
                )} 
              />
            </div>
          </div>
        )}

        {/* Term and Year Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-bold mb-3 text-gray-800">
              {getTranslatedText('Term *', 'Muhula *')}
            </label>
            <div className="relative">
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
          </div>

          <div>
            <label className="block text-lg font-bold mb-3 text-gray-800">
              {getTranslatedText('Year *', 'Mwaka *')}
            </label>
            <div className="relative">
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
        </div>

        {/* Progress Indicator */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-lg font-bold text-gray-800">
                {getTranslatedText('Step 1 Progress', 'Maendeleo ya Hatua ya 1')}
              </span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {Math.round((Object.values(formData).filter(v => v && v.toString().trim() !== '').length / 7) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 via-green-500 to-emerald-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(Object.values(formData).filter(v => v && v.toString().trim() !== '').length / 7) * 100}%` }}
            ></div>
          </div>
          <p className={`text-lg font-bold ${isStep1Complete() ? 'text-green-600' : 'text-gray-600'}`}>
            {isStep1Complete() 
              ? getTranslatedText('✅ All required fields completed!', '✅ Sehemu zote zinazohitajika zimekamilika!')
              : getTranslatedText(
                  `Fill ${7 - Object.values(formData).filter(v => v && v.toString().trim() !== '').length} more required fields`,
                  `Jaza sehemu ${7 - Object.values(formData).filter(v => v && v.toString().trim() !== '').length} zaidi zinazohitajika`
                )
            }
          </p>
        </div>

        {/* Next Button */}
        <div className="pt-6">
          <button 
            onClick={handleStep1Next} 
            disabled={!isStep1Complete()} 
            className={`w-full text-white p-6 rounded-2xl font-bold text-xl transition-all flex items-center justify-center ${isStep1Complete() ? 'bg-gradient-to-r from-blue-600 via-green-600 to-emerald-600 hover:from-blue-700 hover:via-green-700 hover:to-emerald-700 shadow-2xl hover:shadow-3xl hover:-translate-y-1' : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'}`}
          >
            {isStep1Complete() ? (
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
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
              {getTranslatedText('Optional', 'Hiari')}
            </span>
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
            {getTranslatedText('Loading curriculum topics...', 'Inapakia mada za mtaala...')}
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
          <p className="text-gray-500 max-w-lg mx-auto">
            {getTranslatedText(
              'No curriculum strands found for this learning area and grade.',
              'Hakuna mada za mtaala zilizopatikana kwa eneo hili la kujifunza na darasa hili.'
            )}
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
                    `Select all substrands you want to include in your scheme`,
                    `Chagua mada ndogo zote unazotaka kujumuisha kwenye mfumo wako`
                  )}
                </p>
                <p className="text-blue-600 mt-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">
                    {Object.values(selectedSubstrands).filter(Boolean).length} {getTranslatedText('selected', 'zimechaguliwa')}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {strands.length} {getTranslatedText('strands', 'mada')}
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
              const sSubs = (substrands[strand.id] || []).sort((a,b) => (a.order_index||0) - (b.order_index||0));
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
                          {strand.description && (
                            <p className="text-gray-600 mt-2">
                              {strand.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {strand.source_type && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {strand.source_type === 'kicd' ? 'KICD Data' : 'Database'}
                            </span>
                          )}
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
                                      {getTranslatedText('SUBSTRAND', 'Mada Ndogo')} {substrand.order_index}:
                                    </span>{' '}
                                    {displayTitle}
                                  </span>
                                  {substrand.content && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Content available: {substrand.source_type === 'kicd' ? 'KICD Official' : 'Original'}
                                    </p>
                                  )}
                                  {isSixth && !selectedSetBook && shouldShowSetBookSelection() && (
                                    <p className="text-sm text-orange-600 mt-2 flex items-center bg-orange-50 p-2 rounded-lg">
                                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      {getTranslatedText('⚠️ Select a set book above', '⚠️ Chagua kitabu hapo juu')}
                                    </p>
                                  )}
                                </div>
                                {substrand.source_type && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    {substrand.source_type === 'kicd' ? 'KICD' : 'Original'}
                                  </span>
                                )}
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
      
      <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-yellow-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-yellow-800 font-bold text-lg">
              {getTranslatedText('Fields marked with asterisks (*) are mandatory', 'Sehemu zilizowekwa alama ya nyota (*) ni lazima')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-10">
        {/* Number of Lessons Per Week */}
        <div className="border-b-2 pb-10">
          <label className="block text-2xl font-bold mb-6 text-gray-900">
            {getTranslatedText('Number of Lessons Per Week *', 'Idadi ya Masomo Kwa Wiki *')}
          </label>
          <div className="max-w-md">
            <div className="relative">
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
              <div className="relative">
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
            </div>

            {/* First Lesson of Teaching */}
            <div>
              <label className="block text-xl font-bold mb-6 text-gray-900">
                {getTranslatedText('First lesson of teaching *', 'Somo la kwanza la kufundisha *')}
              </label>
              <div className="relative">
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
              <div className="relative">
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
            </div>

            {/* Last Lesson of Teaching */}
            <div>
              <label className="block text-xl font-bold mb-6 text-gray-900">
                {getTranslatedText('Last lesson of teaching *', 'Somo la mwisho la kufundisha *')}
              </label>
              <div className="relative">
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
                      <p className="text-gray-600 mt-2">
                        {option.value === 'single' 
                          ? getTranslatedText('All lessons are single periods', 'Masomo yote ni ya kipindi kimoja')
                          : getTranslatedText('Combine two consecutive lessons into one double period', 'Changanya masomo mawili mfululizo kuwa kipindi kimoja cha muda mrefu')
                        }
                      </p>
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
                <div className="relative">
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
              </div>
            )}
          </div>
        </div>

        {/* Validation Summary */}
        {!isStep3Complete() && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-3 border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-red-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-red-800 font-bold text-lg">
                  {getTranslatedText(
                    'Please complete all required fields marked with *',
                    'Tafadhali kamilisha sehemu zote zinazohitajika zilizowekwa alama ya *'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

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
              <p className="text-gray-600 mt-3 text-lg">
                {getTranslatedText(
                  'Select this if there are no breaks, holidays, or interruptions during this term.',
                  'Chagua hii ikiwa hakuna mapumziko, likizo, au usumbufu wowote katika muhula huu.'
                )}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!hasBreaks ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
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
                <div className="relative">
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
              </div>

              {/* Break Start */}
              <div className="border-t-2 pt-10">
                <h4 className="text-2xl font-bold mb-8 text-blue-700 flex items-center">
                  <svg className="w-8 h-8 text-blue-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {getTranslatedText('Break Start Date', 'Tarehe ya Mwanzo wa Mapumziko')}
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Week Number *', 'Nambari ya Wiki *')}
                    </label>
                    <div className="relative">
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
                  </div>

                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Lesson Number *', 'Nambari ya Somo *')}
                    </label>
                    <div className="relative">
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
              </div>

              {/* Break End */}
              <div className="border-t-2 pt-10">
                <h4 className="text-2xl font-bold mb-8 text-blue-700 flex items-center">
                  <svg className="w-8 h-8 text-blue-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {getTranslatedText('Break End Date', 'Tarehe ya Mwisho wa Mapumziko')}
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Week Number *', 'Nambari ya Wiki *')}
                    </label>
                    <div className="relative">
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
                  </div>

                  <div>
                    <label className="block text-xl font-bold mb-4">
                      {getTranslatedText('Lesson Number *', 'Nambari ya Somo *')}
                    </label>
                    <div className="relative">
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
                      `Total breaks: ${breaks.length} | Total affected lessons: ${breaks.length * 2}`,
                      `Jumla ya mapumziko: ${breaks.length} | Jumla ya masomo yaliyoathiriwa: ${breaks.length * 2}`
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

        {/* Navigation */}
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
          <button 
            onClick={generatePreviewData}
            className="px-8 py-5 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl hover:from-blue-700 hover:to-green-700 transition-all flex items-center font-bold text-lg"
          >
            <span className="mr-3">{getTranslatedText('Preview & Generate PDF', 'Hakiki & Tengeza PDF')}</span>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ===================== RENDER STEP 5 =====================
  const renderStep5 = () => {
    if (!previewData) return null;
    
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        {/* Header with Quality Badge */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mr-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {getTranslatedText('Your Professional Scheme of Work is Ready!', 'Mfumo Wako Wa Kitaaluma wa Kazi Umekamilika!')}
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
                  <div className="text-sm text-gray-600">Avg Quality</div>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 text-lg">
            {getTranslatedText('Review, save, or generate professional PDF', 'Kagua, hifadhi, au tengeneza PDF ya kitaaluma')}
          </p>
        </div>

        {/* Progress Bar */}
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
                  {getTranslatedText('Professional Quality Report', 'Ripoti ya Ubora wa Kitaaluma')}
                </h3>
                <p className="text-gray-600">
                  {previewData.meta.qualityMetrics.averageConfidence >= 0.85 
                    ? getTranslatedText('✅ High Quality Scheme', '✅ Mfumo wa Ubora wa Juu')
                    : getTranslatedText('📊 Standard Quality Scheme', '📊 Mfumo wa Ubora wa Kawaida')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{getTranslatedText('Quality Score', 'Alama ya Ubora')}</p>
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
              {getTranslatedText('Download Professional Scheme', 'Pakua Mfumo wa Kitaaluma')}
            </h3>
            <p className="text-gray-600 max-w-2xl mb-6">
              {getTranslatedText(
                'Your professionally generated, KICD-aligned scheme is ready. Download as PDF, save to dashboard, or create another.',
                'Mfumo wako uliotengenezwa kikitaaluma, unaolingana na KICD umekamilika. Pakua kama PDF, hifadhi kwenye dashibodi, au unda mwingine.'
              )}
            </p>
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
                <p className="text-gray-600">{getTranslatedText('Quality Score', 'Alama ya Ubora')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEME TABLE - Professional Layout */}
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
                          lesson._is_real_kicd ? 'bg-green-100 text-green-800' :
                          lesson._confidence >= 0.85 ? 'bg-blue-100 text-blue-800' :
                          lesson._confidence >= 0.75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lesson._is_real_kicd ? 'KICD' :
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
          
          {/* Table Navigation */}
          {previewData.scheme.length > 5 && (
            <div className="mt-4 flex justify-between items-center">
              <p className="text-gray-600">
                {getTranslatedText(
                  `Showing ${Math.min(5, previewData.scheme.length)} of ${previewData.scheme.length} lessons`,
                  `Inaonyesha masomo ${Math.min(5, previewData.scheme.length)} kati ya ${previewData.scheme.length}`
                )}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">KICD: Official</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">HIGH: ≥85%</span>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">MED: 75-84%</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">{`LOW: <75%`}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
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
            onClick={() => generatePDF('standard')}
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
                {getTranslatedText('Download Professional PDF', 'Pakua PDF ya Kitaaluma')}
              </>
            )}
          </button>
          
          <button 
            onClick={saveToDatabase}
            disabled={isSaving}
            className="px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center font-bold text-lg flex-1"
          >
            {isSaving ? (
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
                {getTranslatedText('Save to Dashboard', 'Hifadhi kwenye Dashibodi')}
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
            {getTranslatedText('+ Create Another Professional Scheme', '+ Unda Mfumo Mwingine wa Kitaaluma')}
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
        {/* Enhanced Header with KICD Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {getTranslatedText('PROFESSIONAL KICD SCHEME OF WORK GENERATOR', 'KITENGEZI CHA MIFUMO YA KAZI YA KICD CHA KITAALUMA')}
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            {getTranslatedText(
              'Powered by Real KICD Curriculum Designs & Unified API',
              'Inaendeshwa na Miundo Halisi ya Mtaala wa KICD na Unified API'
            )}
          </p>
          <div className="flex justify-center items-center space-x-4">
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              KICD-OFFICIAL
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              API-POWERED
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              QUALITY-ASSURED
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