import type { GoogleReview } from './google'

export function isDemoClient(googlePlaceId: string | null | undefined): boolean {
  return !googlePlaceId || googlePlaceId.trim().toUpperCase() === 'DEMO'
}

// ── Used by the fetch-reviews cron (calls Google shape) ──────────────────────
export const DEMO_REVIEWS: GoogleReview[] = [
  {
    reviewId: 'DEMO_001',
    reviewer: { displayName: 'María José García' },
    starRating: 'FIVE',
    comment:
      'Una experiencia increíble. El trato del personal fue exquisito y la habitación estaba impecable. Las vistas desde la terraza son espectaculares. ¡Volveremos sin duda el próximo verano!',
    createTime: '2025-03-18T10:30:00Z',
  },
  {
    reviewId: 'DEMO_002',
    reviewer: { displayName: 'Carlos Rodríguez' },
    starRating: 'FIVE',
    comment:
      'Todo perfecto. El desayuno es abundante y delicioso, la ubicación es inmejorable y el personal siempre dispuesto a ayudar. Muy recomendable para familias.',
    createTime: '2025-03-12T14:20:00Z',
  },
  {
    reviewId: 'DEMO_003',
    reviewer: { displayName: 'Sophie Martin' },
    starRating: 'FOUR',
    comment:
      'Very nice place with great views. The room was clean and comfortable. The only downside was the WiFi being a bit slow. Overall a great stay!',
    createTime: '2025-03-05T09:15:00Z',
  },
  {
    reviewId: 'DEMO_004',
    reviewer: { displayName: 'Antonio Fernández López' },
    starRating: 'ONE',
    comment:
      'Pésima experiencia. Llevábamos la habitación reservada con meses de antelación y al llegar nos dijeron que no tenían disponibilidad. Inaceptable.',
    createTime: '2025-02-27T18:45:00Z',
  },
  {
    reviewId: 'DEMO_005',
    reviewer: { displayName: 'Laura Martínez' },
    starRating: 'FIVE',
    comment:
      'Estuvimos por nuestro aniversario y fue perfecto. Nos prepararon una sorpresa en la habitación que fue un detalle muy bonito. La cena en el restaurante, excelente.',
    createTime: '2025-02-20T16:00:00Z',
  },
  {
    reviewId: 'DEMO_006',
    reviewer: { displayName: 'Roberto Sánchez' },
    starRating: 'THREE',
    comment:
      'La ubicación es buena y el precio correcto. Sin embargo, la habitación era algo pequeña y el ruido de la calle por la noche dificultó el descanso. Mejorable.',
    createTime: '2025-02-14T11:30:00Z',
  },
  {
    reviewId: 'DEMO_007',
    reviewer: { displayName: 'Ana Belén Torres' },
    starRating: 'FIVE',
    comment:
      'No podemos estar más contentas. Personal amabilísimo, instalaciones limpias y modernas, y la zona es ideal para explorar a pie. ¡Repetiremos!',
    createTime: '2025-02-08T08:00:00Z',
  },
  {
    reviewId: 'DEMO_008',
    reviewer: { displayName: 'James Wilson' },
    starRating: 'TWO',
    comment:
      'Unfortunately not what we expected. The room needed maintenance (leaking tap, broken hairdryer). When we reported it, it took two days to fix. The location is good though.',
    createTime: '2025-02-01T20:30:00Z',
  },
  {
    reviewId: 'DEMO_009',
    reviewer: { displayName: 'Pilar Navarro Ruiz' },
    starRating: 'THREE',
    comment:
      'La estancia fue correcta. El personal fue amable pero el servicio de habitaciones tardaba bastante. La piscina estaba cerrada por reformas, algo que no se indicaba al reservar.',
    createTime: '2025-01-25T13:45:00Z',
  },
  {
    reviewId: 'DEMO_010',
    reviewer: { displayName: 'Diego Morales' },
    starRating: 'FIVE',
    comment:
      'Simplemente espectacular. Hemos recorrido muchos establecimientos de la zona y este es sin duda el mejor en relación calidad-precio. Destaco especialmente el spa y el servicio de desayunos.',
    createTime: '2025-01-18T10:15:00Z',
  },
]

// ── Used by the seed endpoint (instant UI population, no OpenAI call) ─────────
export type DemoSeedItem = {
  slot: string
  authorName: string
  rating: number
  text: string
  publishedAt: string
  status: 'pending' | 'published' | 'ignored'
  draft: string
  final?: string
}

export const DEMO_SEED_DATA: DemoSeedItem[] = [
  {
    slot: '001',
    authorName: 'María José García',
    rating: 5,
    text: 'Una experiencia increíble. El trato del personal fue exquisito y la habitación estaba impecable. Las vistas desde la terraza son espectaculares. ¡Volveremos sin duda el próximo verano!',
    publishedAt: '2025-03-18T10:30:00Z',
    status: 'pending',
    draft:
      'Muchas gracias, María José, por compartir tu experiencia con nosotros. Es un placer saber que disfrutaste del trato de nuestro equipo y especialmente de las vistas desde la terraza. Comentarios como el tuyo son el mejor reconocimiento para todo el personal. ¡Te esperamos con los brazos abiertos el próximo verano!',
  },
  {
    slot: '002',
    authorName: 'Carlos Rodríguez',
    rating: 5,
    text: 'Todo perfecto. El desayuno es abundante y delicioso, la ubicación es inmejorable y el personal siempre dispuesto a ayudar. Muy recomendable para familias.',
    publishedAt: '2025-03-12T14:20:00Z',
    status: 'published',
    draft:
      'Gracias, Carlos, por tus palabras tan amables. Nos alegra enormemente que el desayuno, la ubicación y la atención de nuestro equipo estuvieran a la altura de tus expectativas. Las familias siempre son bienvenidas aquí. ¡Esperamos volveros a recibir muy pronto!',
    final:
      'Gracias, Carlos, por tus palabras tan amables. Nos alegra enormemente que el desayuno, la ubicación y la atención de nuestro equipo estuvieran a la altura de tus expectativas. Las familias siempre son bienvenidas aquí. ¡Esperamos volveros a recibir muy pronto!',
  },
  {
    slot: '003',
    authorName: 'Sophie Martin',
    rating: 4,
    text: 'Very nice place with great views. The room was clean and comfortable. The only downside was the WiFi being a bit slow. Overall a great stay!',
    publishedAt: '2025-03-05T09:15:00Z',
    status: 'published',
    draft:
      "Thank you so much for your kind review, Sophie! We're delighted you enjoyed the views and found the room comfortable. We apologise for the WiFi inconvenience and are actively working to improve connectivity throughout the property. We hope to welcome you back very soon!",
    final:
      "Thank you so much for your kind review, Sophie! We're delighted you enjoyed the views and found the room comfortable. We apologise for the WiFi inconvenience and are actively working to improve connectivity throughout the property. We hope to welcome you back very soon!",
  },
  {
    slot: '004',
    authorName: 'Antonio Fernández López',
    rating: 1,
    text: 'Pésima experiencia. Llevábamos la habitación reservada con meses de antelación y al llegar nos dijeron que no tenían disponibilidad. Inaceptable.',
    publishedAt: '2025-02-27T18:45:00Z',
    status: 'pending',
    draft:
      'Estimado Antonio, lamentamos profundamente lo sucedido durante tu llegada. Entendemos tu frustración ante una situación que no debió ocurrir y reconocemos que la gestión no estuvo a la altura de nuestros estándares. Si deseas que revisemos tu caso en detalle, te invitamos a contactarnos directamente. Gracias por hacérnoslo saber; nos ayuda a mejorar.',
  },
  {
    slot: '005',
    authorName: 'Laura Martínez',
    rating: 5,
    text: 'Estuvimos por nuestro aniversario y fue perfecto. Nos prepararon una sorpresa en la habitación que fue un detalle muy bonito. La cena en el restaurante, excelente.',
    publishedAt: '2025-02-20T16:00:00Z',
    status: 'ignored',
    draft:
      'Muchas gracias, Laura, por compartir un momento tan especial con nosotros. Nos alegra saber que vuestra estancia de aniversario fue memorable. El equipo del restaurante se alegrará mucho de leer tus palabras. ¡Feliz aniversario y hasta pronto!',
  },
  {
    slot: '006',
    authorName: 'Roberto Sánchez',
    rating: 3,
    text: 'La ubicación es buena y el precio correcto. Sin embargo, la habitación era algo pequeña y el ruido de la calle por la noche dificultó el descanso. Mejorable.',
    publishedAt: '2025-02-14T11:30:00Z',
    status: 'pending',
    draft:
      'Gracias, Roberto, por tu valoración sincera. Tomamos nota de tus observaciones sobre el tamaño de la habitación y el ruido exterior, aspectos en los que seguimos trabajando para mejorar. Esperamos poder ofrecerte una estancia más satisfactoria en tu próxima visita.',
  },
  {
    slot: '007',
    authorName: 'Ana Belén Torres',
    rating: 5,
    text: 'No podemos estar más contentas. Personal amabilísimo, instalaciones limpias y modernas, y la zona es ideal para explorar a pie. ¡Repetiremos!',
    publishedAt: '2025-02-08T08:00:00Z',
    status: 'published',
    draft:
      'Muchas gracias, Ana Belén, por tus palabras tan cariñosas. Es un orgullo para todo el equipo recibir una valoración tan positiva. La zona es efectivamente ideal para explorar, y nos alegra que las instalaciones hayan cumplido vuestras expectativas. ¡Os esperamos de nuevo muy pronto!',
    final:
      '¡Gracias, Ana Belén y compañía! Nos llena de alegría saber que vuestra estancia fue tan especial. Nuestro equipo siempre da lo mejor, y la zona es preciosa para explorar. ¡Hasta la próxima, que esperamos sea muy pronto!',
  },
  {
    slot: '008',
    authorName: 'James Wilson',
    rating: 2,
    text: 'Unfortunately not what we expected. The room needed maintenance (leaking tap, broken hairdryer). When we reported it, it took two days to fix. The location is good though.',
    publishedAt: '2025-02-01T20:30:00Z',
    status: 'pending',
    draft:
      'Dear James, thank you for taking the time to share your experience. We sincerely apologise for the maintenance issues you encountered and the delay in resolving them — this is not the standard we strive to maintain. We would very much like to make things right; please feel free to contact us directly. We hope you will give us another chance.',
  },
  {
    slot: '009',
    authorName: 'Pilar Navarro Ruiz',
    rating: 3,
    text: 'La estancia fue correcta. El personal fue amable pero el servicio de habitaciones tardaba bastante. La piscina estaba cerrada por reformas, algo que no se indicaba al reservar.',
    publishedAt: '2025-01-25T13:45:00Z',
    status: 'ignored',
    draft:
      'Gracias, Pilar, por tu comentario. Lamentamos que la piscina estuviera cerrada durante tu estancia y entendemos la frustración al no encontrar esta información al reservar. Tomamos nota para mejorar la comunicación sobre instalaciones disponibles. Esperamos que el resto de la estancia fuera de tu agrado.',
  },
  {
    slot: '010',
    authorName: 'Diego Morales',
    rating: 5,
    text: 'Simplemente espectacular. Hemos recorrido muchos establecimientos de la zona y este es sin duda el mejor en relación calidad-precio. Destaco especialmente el spa y el servicio de desayunos.',
    publishedAt: '2025-01-18T10:15:00Z',
    status: 'published',
    draft:
      '¡Muchas gracias, Diego, por tan generosa valoración! Nos alegra enormemente que hayas disfrutado de nuestra propuesta y que el spa y los desayunos hayan sido de tu agrado. Es exactamente la experiencia que buscamos ofrecer a cada huésped. ¡Te esperamos de nuevo muy pronto!',
    final:
      '¡Muchas gracias, Diego, por tan generosa valoración! Nos alegra enormemente que hayas disfrutado de nuestra propuesta y que el spa y los desayunos hayan sido de tu agrado. Es exactamente la experiencia que buscamos ofrecer a cada huésped. ¡Te esperamos de nuevo muy pronto!',
  },
]
