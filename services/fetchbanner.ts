
type Banner = {
    url: string;
}


export async function fetchBanner(): Promise<Banner> {

    const banner = await fetch('https://picsum.photos/400/200')

    return {
        url: banner.url
    }

}