/**
 * Annotation types for TypeScript components
 */

/**
 * Annotation type
 */
export type AnnotationType = 'note' | 'insight' | 'action' | 'event' | 'question';

/**
 * Annotation visibility
 */
export type AnnotationVisibility = 'private' | 'team' | 'public';

/**
 * Data point interface
 */
export interface DataPoint {
  /**
   * Data point ID
   */
  id?: string;
  
  /**
   * Data point date
   */
  date?: string | Date;
  
  /**
   * Data point description
   */
  description?: string;
  
  /**
   * Data point value
   */
  value?: number;
  
  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * New annotation interface
 */
export interface NewAnnotation {
  /**
   * Annotation content
   */
  content: string;
  
  /**
   * Annotation type
   */
  type: AnnotationType;
  
  /**
   * Annotation visibility
   */
  visibility: AnnotationVisibility;
  
  /**
   * Whether the annotation is pinned
   */
  isPinned: boolean;
  
  /**
   * Whether the annotation is high priority
   */
  isHighPriority: boolean;
  
  /**
   * Associated date
   */
  associatedDate: Date;
  
  /**
   * Annotation tags
   */
  tags: string[];
}

/**
 * Annotation interface
 */
export interface Annotation extends NewAnnotation {
  /**
   * Annotation ID
   */
  id: string;
  
  /**
   * User ID
   */
  userId: string;
  
  /**
   * Creation date
   */
  createdAt: string;
  
  /**
   * Update date
   */
  updatedAt: string;
  
  /**
   * Data type
   */
  dataType?: string;
  
  /**
   * Metric type
   */
  metricType?: string;
  
  /**
   * Data point ID
   */
  dataPointId?: string;
}

/**
 * User interface
 */
export interface User {
  /**
   * User name
   */
  name: string;
  
  /**
   * User avatar
   */
  avatar: string | null;
}

/**
 * Form errors interface
 */
export interface FormErrors {
  /**
   * Content error
   */
  content?: string;
  
  /**
   * Other errors
   */
  [key: string]: string | undefined;
}

export default Annotation;
