import React, { useEffect, useState } from 'react';
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
  const [currentImage, setCurrentImage] = useState('https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg');
  const [gallery, setGallery] = useState<Photo[]>([]);

  const fetchImages = async () => {
      try {

        const loginRes = await fetch('https://photo.bonmais.com/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: '*',
            password: '*'
          }),
        });

        if (!loginRes.ok) throw new Error('Échec de connexion');

        const loginData = await loginRes.json();
        const token = loginData.access_token

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

  return (
    <div
      style={{height: "100vh", width: "100vw", margin: 0, padding: 0, overflow: "hidden" }}
      className='flex'
    >
      {/* <button onClick={openImgEditor}>Open Filerobot image editor</button> */}
      <div className='border h-screen overflow-y-scroll bg-transparent grid grid-cols-3 gap-1 w-[30%] p-2' >
        {gallery.map((img, index) => (
          <img
            key={index}
            src={img.previewUrl}
            alt={`Preview ${index + 1}`}
            className='w-24 h-24 cursor-pointer border border-slate-300 rounded'
            onClick={() => {fetchImages(); setCurrentImage(img.originalUrl)} }
          />
        ))}
      </div>

        <FilerobotImageEditor
          source={currentImage}
          onSave={(editedImageObject, designState) =>
            console.log('saved', editedImageObject, designState)
          }
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
