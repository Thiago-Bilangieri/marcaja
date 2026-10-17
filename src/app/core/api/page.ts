// Formato das listagens paginadas da API (Spring Data, serialization-mode: via-dto)
export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
