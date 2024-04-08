import bg from '../assets/bg-min.png';
function Home() {

  return <div className='p-4'>

    <h1 className='text-center'>Completely Free to Use Tools</h1>
    <h3 className='text-center'>no subscriptions, no premium</h3>
    <div className='flex' style={{ width: '100%', minWidth: '900px', justifyContent: 'center' }}>
      <img style={{ width: '896px', height: '512px' }} src={bg} />
    </div>
    <p><b>Bulk Image Format Conversion:</b> This feature allows users to upload multiple images in common formats (JPEG, PNG, BMP, GIF, etc.) and convert them into another chosen format. The process supports batch operations, enabling the conversion of large numbers of images simultaneously, which is particularly useful for photographers, designers, and web developers looking to streamline their workflow.</p>

    <p><b>Merge Images into PDF:</b> Users can select a series of images and merge them into a single PDF document. This feature is handy for creating portfolios, presentations, or digital books. The website offers options to adjust the order of images, set the orientation (portrait or landscape), and customize the margin size. It might also provide tools for adding metadata like titles, authors, and subjects to the PDF.</p>

    <p><b>Merge Images into Video:</b> This innovative feature allows users to combine multiple images into a video sequence. Users can customize the duration each image appears on the screen, add transition effects between images, and insert background music to create engaging slideshows or visual presentations. This tool is perfect for creating quick video content for social media, educational purposes, or personal keepsakes.</p>
  </div>
}

export default Home;