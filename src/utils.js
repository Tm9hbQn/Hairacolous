export const getGradientClass = (conditionId) => {
    switch (conditionId) {
      case 'PERFECT_DAY':
        return 'bg-gradient-perfect';
      case 'SAUNA_STORM':
        return 'bg-gradient-storm';
      case 'SAUNA_CALM':
        return 'bg-gradient-humid';
      default:
        return 'bg-gradient-perfect';
    }
  };

  export const getDoseLevel = (text) => {
    if (!text) return 'normal';
    const lowerText = text.toLowerCase();

    // Check for "Low" / "Little" first to catch phrases like "a little... don't..."
    if (lowerText.includes('טיפה') || lowerText.includes('מעט') || lowerText.includes('קליל') || lowerText.includes('דק') || lowerText.includes('עדין')) {
      return 'low';
    }

    // Check for "High" / "Generous"
    if (lowerText.includes('בנדיבות') || lowerText.includes('להעמיס') || lowerText.includes('חובה') || lowerText.includes('הרבה') || lowerText.includes('חזק') || lowerText.includes('מלא')) {
      return 'high';
    }

    // Check for specific "None" / "Skip" phrases
    // "לא" alone is too broad, so we use specific phrases found in the data
    if (lowerText.includes('לא צריך') || lowerText.includes('לא היום') || lowerText.includes('לוותר') || lowerText.includes('none') || lowerText.includes('אין צורך') || lowerText.includes('לא חובה')) {
      return 'none';
    }

    // Default to "Normal"
    return 'normal';
  };

  export const getProductIconKey = (key) => {
    const map = {
      shampoo: 'droplet',
      conditioner: 'wind',
      mask: 'sparkles',
      leave_in: 'cloud',
      gel: 'shield',
      oil: 'star',
      styling_tip: 'lightbulb',
      water_refresh: 'spray',
      product_mix: 'shuffle',
      protection: 'shield_check'
    };
    return map[key] || 'sparkles';
  };

  export const getProductLabel = (key) => {
    const map = {
        shampoo: 'שמפו',
        conditioner: 'מרכך',
        mask: 'מסכה',
        leave_in: 'ליב-אין',
        gel: 'ג\'ל/מוס',
        oil: 'שמן/סרום',
        styling_tip: 'טיפ',
        water_refresh: 'רענון מים',
        product_mix: 'מיקס חומרים',
        protection: 'הגנה'
    };
    return map[key] || key;
  }
