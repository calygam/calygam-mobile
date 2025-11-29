import apiAzure from '../api/apiAzure';

/**
 * Busca o pet equipado do usuário
 * Backend retorna InventoryPetsDTO com todos os dados (energia, boosts, estado, imagem)
 */
export async function fetchEquippedPet() {
  try {
    const response = await apiAzure.get('/inventory/get/pet/equipped');
    return response.data || null;
  } catch (error) {
    console.error('Erro ao buscar pet equipado:', error);
    return null;
  }
}

/**
 * Busca todos os pets não equipados do usuário
 */
export async function fetchUnequippedPets() {
  try {
    const response = await apiAzure.get('/inventory/get/pets/unequip');
    return response.data || [];
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    return [];
  }
}

/**
 * Alimenta o pet
 * @param {number} petId - ID do pet
 * @param {boolean} feedMax - Se true, alimenta até o máximo possível
 */
export async function feedPet(petId, feedMax = false) {
  try {
    const response = await apiAzure.put(`/pet/feed/${petId}`, null, {
      params: { feedMax }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao alimentar pet:', error);
    throw error;
  }
}

/**
 * Equipa ou desequipa um pet (toggle) conforme backend.
 * @param {number} itemId - ID do pet no inventário/catálogo.
 * @param {string} categoryType - Enum do catálogo (PET, SKIN, THEME). Default PET.
 * @returns {object} ApiSucessHandler<String> { responseOk, responseMsg, responseData }
 */
export async function equipPet(itemId, categoryType = 'PET') {
  try {
    const response = await apiAzure.put(`/inventory/equip/pet/item/${itemId}/category/${categoryType}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao equipar/desequipar pet:', error?.response?.data || error.message);
    throw error;
  }
}
