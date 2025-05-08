import axios from 'axios';

/**
 * Service for interacting with the natural language processing capabilities
 * of the PPrePorter backend
 */
class NaturalLanguageService {
  /**
   * Submit a natural language query to the backend
   * @param {string} query - The natural language query text
   * @param {Object} context - Optional context information
   * @returns {Promise} - Promise containing the query results
   */
  async submitQuery(query, context = {}) {
    try {
      const response = await axios.post('/api/naturallanguage/query', {
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
   * @returns {Promise} - Promise containing the query results
   */
  async submitFollowUpQuery(query, previousQueryId) {
    try {
      const response = await axios.post('/api/naturallanguage/followup', {
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
   * @param {Object} responses - Key-value pairs of clarification responses
   * @returns {Promise} - Promise containing the clarified query results
   */
  async submitClarification(originalQuery, responses) {
    try {
      const response = await axios.post('/api/naturallanguage/clarify', {
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
   * @returns {Promise} - Promise containing suggested queries
   */
  async getSuggestedQueries(context = '') {
    try {
      const response = await axios.get('/api/naturallanguage/suggestions', {
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