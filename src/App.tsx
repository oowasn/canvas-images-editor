import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from 'react-filerobot-image-editor';

type RawPhoto = {
  id: number;
  path: string;
  galleryPath: string;
  fullscreenPath: string;
  url: string;
  dateTaking: string;
  // folder: string; // Uncomment if you implement folder functionality
}

type Photo = {
  id: number;
  originalUrl: string;      // URL grande taille
  previewUrl: string;    // vignette ou miniature
};

export default function Home() {
  // const [isImgEditorShown, setIsImgEditorShown] = useState(false);
  const location = useLocation();
  const v = new URLSearchParams(location.search).get('path')
  const [currentImage, setCurrentImage] = useState(
    v ? v : 'https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg'
  );
  const [gallery, setGallery] = useState<Photo[]>([]);
  const [mesParams, setMesParams] = useState({});
  const [token, setToken] = useState('');

  const getToken = async () => {
    const loginRes = await fetch('https://photo.bonmais.com/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'oowasn',
            password: 'password'
          }),
        });
        if (!loginRes.ok) throw new Error('Échec de connexion');
        const loginData = await loginRes.json();
        setToken(loginData.access_token)
  }

  const fetchImages = async () => {
      try {

        getToken();

        const photoRes = await fetch('https://photo.bonmais.com/photos/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!photoRes.ok) throw new Error('Échec de récupération des images');
        const data: {data: RawPhoto[], meta: {
            totalCount: number,
            page: number,
            limit: number,
            totalPages: number
        }} = await photoRes.json();

        // adapte ce format si la structure de l’API est différente
        console.log(data)
        const photos : Photo[] = data.data.map((item: RawPhoto) => ({
          id: item.id,
          originalUrl: 'https://photo.bonmais.com/' + item.path,
          previewUrl: 'https://photo.bonmais.com/' + item.galleryPath
        }));
        setGallery(photos);
      } catch (err) {
        console.log('Erreur lors de la récupération des images :', err);
      }
    };

  useEffect(() => {

    setGallery(prev => [...prev, {
        id: 0,
        originalUrl: 'https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg',
        previewUrl: 'https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg'
    }])

  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const path = queryParams.get('path')

    console.log(path)
    setCurrentImage('https://photo.bonmais.com/' + path)
    // setMesParams(mesDonnees);
  }, [location.search]);

  return (
    <div
      style={{width: "100vw", margin: 0, padding: 0, }}
      className='min-h-[100vh] flex flex-col-reverse xl:flex-row'
    >
      {/* <button onClick={openImgEditor}>Open Filerobot image editor</button> */}
      <div className='flex flex-col h-72 bg-transparent xl:h-screen overflow-y-scroll w-full xl:w-[35%] p-2 xl:p-4'>
        <button onClick={ () => fetchImages() } className='w-28 h-10 bg-indigo-600 text-white rounded my-2 mb-4'>
          Rafraichir
        </button>
        <div className='border     grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-3 gap-4 ' >
          {gallery.map((img, index) => (
            <img
              key={index}
              src={img.previewUrl}
              alt={`Preview ${index + 1}`}
              className='w-24 h-24 xl:w-28 xl:h-28 cursor-pointer border border-slate-300 rounded'
              onClick={() => {fetchImages(); setCurrentImage(img.originalUrl)} }
            />
          ))}
        </div>
      </div>

        <FilerobotImageEditor
          source={currentImage}
          onSave={async (editedImageObject, designState) => {
            const base64Data = editedImageObject.imageBase64;

             if (!base64Data) {
              console.error('Aucune image à uploader (base64 vide)');
              return;
            }
            // Convertir base64 → Blob
            const response = await fetch(base64Data);
            const blob = await response.blob();
            // Créer un objet File (optionnel mais plus propre pour certains backends)
            const file = new File([blob], 'image-modifiee.png', { type: blob.type });
            // Préparer le FormData
            const formData = new FormData();
            formData.append('files', file);

            try {
              getToken();
              const uploadResponse = await fetch('https://photo.bonmais.com/photos/upload', {
                method: 'POST',
                body: formData,
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              });

              if (!uploadResponse.ok) {
                throw new Error("Erreur lors de l'envoi");
              }

              const result = await uploadResponse.json();
              console.log('Upload réussi:', result);
            } catch (err) {
              console.error('Erreur upload:', err);
            }
          }}
          annotationsCommon={{
            fill: '#ff0000',
          }}
          Image={{
            fill: '#000',
            gallery: gallery,
          }}
          onClose={() => console.log('close')}
          savingPixelRatio={8}
          previewPixelRatio={window.devicePixelRatio}
          Text={{ text: 'Filerobot...' }}
          Rotate={{ angle: 90, componentType: 'slider' }}
          Crop={{
            presetsItems: [
              {
                titleKey: 'classicTv',
                descriptionKey: '4:3',
                ratio: 4 / 3,
                // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
              },
              {
                titleKey: 'cinemascope',
                descriptionKey: '21:9',
                ratio: 21 / 9,
                // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
              },
            ],
            presetsFolders: [
              {
                titleKey: 'socialMedia', // will be translated into Social Media as backend contains this translation key
                // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
                groups: [
                  {
                    titleKey: 'facebook',
                    items: [
                      {
                        titleKey: 'profile',
                        width: 180,
                        height: 180,
                        descriptionKey: 'fbProfileSize',
                      },
                      {
                        titleKey: 'coverPhoto',
                        width: 820,
                        height: 312,
                        descriptionKey: 'fbCoverPhotoSize',
                      },
                    ],
                  },
                ],
              },
            ],
          }}
          tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FILTERS, TABS.FINETUNE, TABS.RESIZE]} // or {['Adjust', 'Annotate', 'Watermark']}
          defaultTabId={TABS.ANNOTATE} // or 'Annotate'
          defaultToolId={TOOLS.TEXT} // or 'Text'
        />
    </div>
  );
}
