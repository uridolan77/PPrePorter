import axios, { AxiosResponse } from 'axios';

// Types
interface QueryContext {
  [key: string]: any;
}

interface QueryResponse {
  id: string;
  query: string;
  result: any;
  timestamp: string;
  status: string;
  metadata?: {
    executionTime?: number;
    confidence?: number;
    dataSource?: string;
  };
}

interface ClarificationResponses {
  [key: string]: string | number | boolean;
}

interface SuggestedQuery {
  id: string;
  text: string;
  category: string;
  description?: string;
}

/**
 * Service for interacting with the natural language processing capabilities
 * of the PPrePorter backend
 */
class NaturalLanguageService {
  /**
   * Submit a natural language query to the backend
   * @param {string} query - The natural language query text
   * @param {QueryContext} context - Optional context information
   * @returns {Promise<QueryResponse>} - Promise containing the query results
   */
  async submitQuery(query: string, context: QueryContext = {}): Promise<QueryResponse> {
    try {
      const response: AxiosResponse<QueryResponse> = await axios.post('/api/naturallanguage/query', {
        query,
        context
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting natural language query:', error);
      throw error;
    }
  }
  
  /**
   * Submit a follow-up question related to a previous query
   * @param {string} query - The follow-up question text
   * @param {string} previousQueryId - The ID of the previous query for context
   * @returns {Promise<QueryResponse>} - Promise containing the query results
   */
  async submitFollowUpQuery(query: string, previousQueryId: string): Promise<QueryResponse> {
    try {
      const response: AxiosResponse<QueryResponse> = await axios.post('/api/naturallanguage/followup', {
        query,
        previousQueryId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting follow-up query:', error);
      throw error;
    }
  }
  
  /**
   * Submit clarification responses to ambiguous queries
   * @param {string} originalQuery - The original query that needed clarification
   * @param {ClarificationResponses} responses - Key-value pairs of clarification responses
   * @returns {Promise<QueryResponse>} - Promise containing the clarified query results
   */
  async submitClarification(originalQuery: string, responses: ClarificationResponses): Promise<QueryResponse> {
    try {
      const response: AxiosResponse<QueryResponse> = await axios.post('/api/naturallanguage/clarify', {
        originalQuery,
        responses
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting clarification:', error);
      throw error;
    }
  }
  
  /**
   * Get suggested queries for users to try
   * @param {string} context - Optional context to influence suggestions
   * @returns {Promise<SuggestedQuery[]>} - Promise containing suggested queries
   */
  async getSuggestedQueries(context: string = ''): Promise<SuggestedQuery[]> {
    try {
      const response: AxiosResponse<SuggestedQuery[]> = await axios.get('/api/naturallanguage/suggestions', {
        params: { context }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting suggested queries:', error);
      throw error;
    }
  }
}

export default new NaturalLanguageService();
